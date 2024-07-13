import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import useSearch from "@hooks/useSearch";
import SymbolDetail from "@components/SymbolDetail";

import Scrollable from "@layoutKit/Scrollable";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    onlyExactMatches,
    setOnlyExactMatches,
    searchResults,
    totalSearchResults,
  } = useSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        setSearchQuery(value.trim());
      }
      if (key === "exact") {
        setOnlyExactMatches(value === "true" || value === "1");
      } else {
        setOnlyExactMatches(false);
      }
    });
  }, [location, setSearchQuery, setOnlyExactMatches]);

  const searchResultSymbols = useMemo(
    () => searchResults.map((searchResult) => searchResult.symbol),
    [searchResults]
  );

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <Scrollable>
      {totalSearchResults} search result{totalSearchResults !== 1 ? "s" : ""}{" "}
      for: {searchQuery}
      <Button onClick={() => setOnlyExactMatches((prev) => !prev)}>
        Toggle Exact Match (currently {onlyExactMatches ? "on" : "off"})
      </Button>
      {searchResultSymbols.map((tickerSymbol) => (
        <SymbolDetail
          key={tickerSymbol}
          tickerSymbol={tickerSymbol}
          groupTickerSymbols={searchResultSymbols}
        />
      ))}
    </Scrollable>
  );
}
