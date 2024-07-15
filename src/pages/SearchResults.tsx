import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Switch, FormControlLabel, Typography } from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";

import useSearch from "@hooks/useSearch";
import SymbolDetailList from "@components/SymbolDetailList";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery: _setSearchQuery,
    onlyExactMatches,
    setOnlyExactMatches: _setOnlyExactMatches,
    searchResults,
    totalSearchResults,
  } = useSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        _setSearchQuery(value.trim());
      }
      if (key === "exact") {
        _setOnlyExactMatches(value === "true" || value === "1");
      } else {
        _setOnlyExactMatches(false);
      }
    });
  }, [location, _setSearchQuery, _setOnlyExactMatches]);

  const toggleExactMatch = () => {
    const searchParams = new URLSearchParams(location.search);
    const newExactValue = !(searchParams.get("exact") === "true");

    if (newExactValue) {
      searchParams.set("exact", "true");
    } else {
      searchParams.delete("exact");
    }

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    _setOnlyExactMatches(newExactValue);
  };

  const searchResultSymbols = useMemo(
    () => searchResults.map((searchResult) => searchResult.symbol),
    [searchResults]
  );

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <Scrollable>
      <Padding>
        <Box
          display="flex"
          alignItems="center"
          sx={{ display: "inline-block" }}
        >
          <FormControlLabel
            control={
              <Switch checked={onlyExactMatches} onChange={toggleExactMatch} />
            }
            label={
              <Typography variant="body1" color="textSecondary">
                Toggle Exact Match
              </Typography>
            }
          />
        </Box>
        {totalSearchResults} search result{totalSearchResults !== 1 ? "s" : ""}{" "}
        for &quot;{searchQuery}&quot;
      </Padding>
      <SymbolDetailList tickerSymbols={searchResultSymbols} />
    </Scrollable>
  );
}
