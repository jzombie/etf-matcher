import React, { useCallback, useEffect, useState } from "react";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Grid, IconButton, Paper, TextField, Typography } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";
import { RustServiceTickerSearchResult } from "@src/types";

import AvatarLogo from "@components/AvatarLogo";

import useSearch from "@hooks/useSearch";

export type PortfolioFormFieldsItemProps = {
  initialBucketTicker?: TickerBucketTicker;
};

export default function PortfolioFormFieldsItem({
  initialBucketTicker,
}: PortfolioFormFieldsItemProps) {
  const { searchQuery, setSearchQuery, searchResults } = useSearch();
  const [bucketTicker, setBucketTicker] =
    useState<TickerBucketTicker | void | null>(initialBucketTicker);

  const handleSymbolInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;

      setBucketTicker(null);
      setSearchQuery(value);
    },
    [setSearchQuery],
  );

  const handleQuantityInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      console.debug({ name, value });
    },
    [],
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
    },
    [setSearchQuery],
  );

  useEffect(() => {
    console.log({ searchResults });
  }, [searchResults]);

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
          {searchResults.map((handleSelectTicker) => (
            <Grid item xs={12} sm={6} md={4} key={handleSelectTicker.ticker_id}>
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
                }}
                onClick={() => handleSelectSearchResult(handleSelectTicker)}
              >
                <AvatarLogo tickerDetail={handleSelectTicker} />
                <Typography variant="h6">
                  {handleSelectTicker.symbol}
                </Typography>
                <Typography variant="body2">
                  {handleSelectTicker.company_name}
                </Typography>
                <Typography variant="caption">
                  {handleSelectTicker.exchange_short_name}
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
