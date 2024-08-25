import React, { useCallback, useEffect, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import AvatarLogo from "@components/AvatarLogo";

import useSearch from "@hooks/useSearch";

export default function PortfolioFormFieldsItem() {
  const { searchQuery, setSearchQuery, searchResults } = useSearch();
  // const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const handleSymbolInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
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

  const handleSelectSymbol = useCallback((symbol: string) => {
    // setSelectedSymbol(symbol);
  }, []);

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
          name="symbol"
          label="Symbol"
          variant="outlined"
          fullWidth
          required
          value={searchQuery}
          onChange={handleSymbolInputChange}
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          name="shares"
          label="Shares"
          variant="outlined"
          fullWidth
          required
          type="number"
          onChange={handleQuantityInputChange}
          disabled
        />
      </Grid>
      <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
        <IconButton>
          <RemoveCircleOutlineIcon color="error" />
        </IconButton>
      </Grid>

      {searchResults.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {searchResults.map((result) => (
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
                }}
                onClick={() => handleSelectSymbol(result.symbol)}
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
