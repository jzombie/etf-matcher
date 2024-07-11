import { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "@hooks/useStoreStateReader";
import type { SearchResult } from "@src/store";

export default function useSearch(initialQuery: string = "") {
  const [searchQuery, _setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, _setSearchResults] = useState<SearchResult[]>([]);
  const [totalSearchResults, _setTotalSearchResults] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const totalPages = useMemo(
    () => Math.ceil(totalSearchResults / pageSize),
    [totalSearchResults, pageSize]
  );
  const remaining = useMemo(
    () => totalSearchResults - ((page - 1) * pageSize + searchResults.length),
    [totalSearchResults, page, pageSize, searchResults]
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const resetSearch = useCallback(() => {
    _setSearchQuery("");
    _setSearchResults([]);
    _setTotalSearchResults(0);
    setPage(1);
    setSelectedIndex(-1);
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      resetSearch();
    }
  }, [searchQuery, resetSearch]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    _setSearchQuery(searchQuery.toUpperCase().trim());
  }, []);

  useEffect(() => {
    store
      .searchSymbols(searchQuery, page, pageSize)
      .then((searchResultsWithTotalCount) => {
        const { results, total_count } = searchResultsWithTotalCount;

        _setSearchResults(results);
        _setTotalSearchResults(total_count);
      });
  }, [searchQuery, page, pageSize]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalSearchResults,
    selectedIndex,
    setSelectedIndex,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    remaining,
    resetSearch,
  };
}
