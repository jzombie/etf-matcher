import { useCallback, useEffect, useState } from "react";

import { store } from "@hooks/useStoreStateReader";
import type { SearchResult } from "@src/store";

export default function useSearch(initialQuery: string = "") {
  const [searchQuery, _setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, _setSearchResults] = useState<SearchResult[]>([]);
  const [totalSearchResults, _setTotalSearchResults] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const resetSearch = useCallback(() => {
    _setSearchQuery("");
    _setSearchResults([]);
    _setTotalSearchResults(0);
    setSelectedIndex(-1);
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    _setSearchQuery(searchQuery.toUpperCase());
  }, []);

  useEffect(() => {
    store.searchSymbols(searchQuery).then((searchResultsWithTotalCount) => {
      const { results, total_count } = searchResultsWithTotalCount;

      _setSearchResults(results);
      _setTotalSearchResults(total_count);
    });
  }, [searchQuery]);

  useEffect(() => {
    store.searchSymbols(searchQuery).then((searchResultsWithTotalCount) => {
      const { results, total_count } = searchResultsWithTotalCount;

      _setSearchResults(results);
      _setTotalSearchResults(total_count);
    });
  }, [searchQuery]);

  // TODO: Include pagination
  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalSearchResults,
    selectedIndex,
    setSelectedIndex,
    resetSearch,
  };
}
