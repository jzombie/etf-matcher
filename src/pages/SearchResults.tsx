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
  } = useSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        setSearchQuery(value.trim());
      }
      if (key === "exact") {
        setOnlyExactMatches(value === "true" || value === "1");
      }
    });
  }, [location, setSearchQuery, setOnlyExactMatches]);

  const toggleExactMatch = () => {
    const searchParams = new URLSearchParams(location.search);
    const newExactValue = !(
      searchParams.get("exact") === "true" || searchParams.get("exact") === "1"
    );

    if (newExactValue) {
      searchParams.set("exact", "true");
    } else {
      searchParams.delete("exact");
    }

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    setOnlyExactMatches(newExactValue);
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
      Search results for: {searchQuery}
      <Button onClick={toggleExactMatch}>
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
