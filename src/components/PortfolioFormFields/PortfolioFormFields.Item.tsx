import React, { useCallback, useEffect, useState } from "react";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid, IconButton, Paper, TextField, Typography } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";
import { RustServiceTickerSearchResult } from "@src/types";

import AvatarLogo from "@components/AvatarLogo";

import useSearch from "@hooks/useSearch";

import customLogger from "@utils/customLogger";

export type PortfolioFormFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
};

// TODO: Extract keyboard-selectable grid into a separate component?
export default function PortfolioFormFieldsItem({
  initialBucketTicker,
}: PortfolioFormFieldsItemProps) {
  const { searchQuery, setSearchQuery, searchResults } = useSearch();
  const [bucketTicker, setBucketTicker] =
    useState<TickerBucketTicker | void | null>(initialBucketTicker);

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const columns = 3; // Assuming 3 columns in the grid (adjust as necessary)

  const handleSymbolInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setBucketTicker(null);
      setSearchQuery(value);
      setHighlightedIndex(null); // Reset highlighted index when query changes
    },
    [setSearchQuery],
  );

  const handleQuantityInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      if (bucketTicker) {
        setBucketTicker({
          ...bucketTicker,
          // Coerce to positive values
          quantity: Math.abs(parseFloat(value)),
        });
      } else {
        customLogger.error(
          "Cannot add quantity to non-existing `bucketTicker`",
        );
      }
    },
    [bucketTicker],
  );

  const handleSelectSearchResult = useCallback(
    (tickerSearchResult: RustServiceTickerSearchResult) => {
      setBucketTicker({
        tickerId: tickerSearchResult.ticker_id,
        symbol: tickerSearchResult.symbol,
        exchangeShortName: tickerSearchResult.exchange_short_name,
        quantity: 1,
      });

      setSearchQuery("");
      setHighlightedIndex(null); // Reset the highlighted index after selection
    },
    [setSearchQuery],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (searchResults.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex + columns >= searchResults.length
              ? prevIndex === null
                ? 0
                : prevIndex // Stay on the last row if it's not full
              : prevIndex + columns,
          );
          break;
        case "ArrowUp":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex - columns < 0
              ? prevIndex // Stay on the first row
              : prevIndex - columns,
          );
          break;
        case "ArrowRight":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === searchResults.length - 1
              ? 0 // Loop around to the first item
              : prevIndex + 1,
          );
          break;
        case "ArrowLeft":
          setHighlightedIndex((prevIndex) =>
            prevIndex === null || prevIndex === 0
              ? searchResults.length - 1 // Loop around to the last item
              : prevIndex - 1,
          );
          break;
        case "Enter":
          if (highlightedIndex !== null && searchResults[highlightedIndex]) {
            handleSelectSearchResult(searchResults[highlightedIndex]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchResults, highlightedIndex, handleSelectSearchResult, columns]);

  return (
    <>
      <Grid item xs={5}>
        {
          // TODO: Show logo, if selected
        }
        <TextField
          name="symbol_or_company_name"
          label="Symbol or Company Name"
          variant="outlined"
          fullWidth
          required
          value={bucketTicker?.symbol || searchQuery}
          disabled={Boolean(bucketTicker)}
          onChange={handleSymbolInputChange}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          name="shares"
          label="Shares"
          variant="outlined"
          fullWidth
          required
          type="number"
          value={bucketTicker?.quantity || ""}
          onChange={handleQuantityInputChange}
          disabled={!bucketTicker}
        />
      </Grid>
      <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
        <IconButton disabled>
          <RemoveCircleOutlineIcon color={"disabled" /** or "error" */} />
        </IconButton>
      </Grid>

      {searchResults.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {searchResults.map((result, index) => (
            <Grid item xs={12} sm={6} md={4} key={result.ticker_id}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,.1)",
                  },
                  width: "100%",
                  height: "100%",
                  backgroundColor:
                    highlightedIndex === index
                      ? "rgba(255,255,255,.2)"
                      : "inherit",
                }}
                onClick={() => handleSelectSearchResult(result)}
              >
                <AvatarLogo tickerDetail={result} />
                <Typography variant="h6">{result.symbol}</Typography>
                <Typography variant="body2">{result.company_name}</Typography>
                <Typography variant="caption">
                  {result.exchange_short_name}
                </Typography>
              </Paper>
            </Grid>
          ))}
          {
            // TODO: Add pagination?
          }
        </Grid>
      )}
    </>
  );
}
