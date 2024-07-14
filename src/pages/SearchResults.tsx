import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import useSearch from "@hooks/useSearch";
import SymbolDetailList from "@components/SymbolDetailList";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

// TODO: Show search button if no search results

// TODO: Include recent searches, or suggestions

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // Note: The usage of `_` prefixes urges the usage to be aware before setting
  // these values directly. They should be set as the result of URL change operations
  // to ensure the queries are deep-linkable.
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

  // IMPORTANT: This adjusts the URL query as well and should be used instead
  // of setting only exact matches directly
  const toggleExactMatch = () => {
    const searchParams = new URLSearchParams(location.search);
    const newExactValue = !(
      // Note: This is a string value since it's in the URL
      (searchParams.get("exact") === "true")
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
        {totalSearchResults} search result{totalSearchResults !== 1 ? "s" : ""}{" "}
        for &quot;{searchQuery}&quot;{" "}
        <Button onClick={toggleExactMatch} variant="contained">
          {onlyExactMatches ? "Disable Exact Match" : "Enable Exact Match"}
        </Button>
      </Padding>
      <SymbolDetailList tickerSymbols={searchResultSymbols} />
    </Scrollable>
  );
}
