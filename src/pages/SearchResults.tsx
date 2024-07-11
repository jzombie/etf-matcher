import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "antd";

import { store } from "@hooks/useStoreStateReader";
import useSearch from "@hooks/useSearch";
import SymbolDetail from "@components/SymbolDetail";

export default function SearchResults() {
  const location = useLocation();
  // const [searchQuery, setSearchQuery] = useState<string>("");
  // const [isExact, setIsExact] = useState<boolean>(false);
  // const [symbols, setSymbols] = useState<string[]>([]);

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
        // String values from URL
        setOnlyExactMatches(value === "true" || value === "1");
      }
    });
  }, [location, setSearchQuery, setOnlyExactMatches]);

  // useEffect(() => {
  //   store
  //     .searchSymbols(searchQuery)
  //     .then((searchResultsWithTotalCount: SearchResultsWithTotalCount) => {
  //       const { results: searchResults } = searchResultsWithTotalCount;

  //       const symbols = searchResults.map((result) => result.symbol);

  //       let returnedSymbols: string[] = symbols;

  //       if (isExact) {
  //         if (symbols.includes(searchQuery.trim())) {
  //           returnedSymbols = [searchQuery];
  //         } else {
  //           returnedSymbols = [];
  //         }
  //       }

  //       setSymbols(returnedSymbols);
  //     });
  // }, [searchQuery, isExact]);

  if (!searchQuery) {
    return <div>No search query...</div>;
  }

  return (
    <div>
      Search results for: {searchQuery}
      <Button onClick={() => setOnlyExactMatches((prev) => !prev)}>
        Toggle Exact Match (currently {onlyExactMatches ? "on" : "off"})
      </Button>
      {searchResults.map((searchResult) => (
        <SymbolDetail
          key={searchResult.symbol}
          tickerSymbol={searchResult.symbol}
        />
      ))}
    </div>
  );
}
