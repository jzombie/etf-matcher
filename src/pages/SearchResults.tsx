import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { store } from "@hooks/useStoreStateReader";
import SymbolDetail from "@components/SymbolDetail";

import type { SearchResultsWithTotalCount } from "@src/store";

export default function SearchResults() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExact, setIsExact] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        setSearchQuery(value.trim());
      }
      if (key === "exact") {
        // String values from URL
        setIsExact(value === "true" || value === "1");
      }
    });
  }, [location]);

  useEffect(() => {
    store
      .searchSymbols(searchQuery)
      .then((searchResultsWithTotalCount: SearchResultsWithTotalCount) => {
        const { results: searchResults } = searchResultsWithTotalCount;

        const symbols = searchResults.map((result) => result.symbol);

        let returnedSymbols: string[] = symbols;

        if (isExact) {
          if (symbols.includes(searchQuery.trim())) {
            returnedSymbols = [searchQuery];
          } else {
            returnedSymbols = [];
          }
        }

        setSymbols(returnedSymbols);
      });
  }, [searchQuery, isExact]);

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <div>
      Search results for: {searchQuery}
      {symbols.map((tickerSymbol) => (
        <SymbolDetail key={tickerSymbol} tickerSymbol={tickerSymbol} />
      ))}
    </div>
  );
}
