import { useCallback, useEffect, useMemo, useState } from "react";
import { store } from "@hooks/useStoreStateReader";
import type { SearchResult } from "@src/store";

export type UseSearchProps = {
  initialQuery?: string;
  initialPageSize?: number;
};

const DEFAULT_PROPS: Required<UseSearchProps> = {
  initialQuery: "",
  initialPageSize: 20,
};

export default function useSearch(props: UseSearchProps = DEFAULT_PROPS) {
  const mergedProps: Required<UseSearchProps> = useMemo(
    () => ({ ...DEFAULT_PROPS, ...props }),
    [props]
  );

  const [searchQuery, _setSearchQuery] = useState<string>(
    mergedProps.initialQuery
  );
  const [searchResults, _setSearchResults] = useState<SearchResult[]>([]);
  const [totalSearchResults, _setTotalSearchResults] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(mergedProps.initialPageSize);
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

  const setSearchQuery = useCallback((searchQuery: string) => {
    _setSearchQuery(searchQuery.toUpperCase().trim());
  }, []);

  // Perform search or reset
  useEffect(() => {
    if (!searchQuery.trim().length) {
      resetSearch();
    } else {
      store
        .searchSymbols(searchQuery, page, pageSize)
        .then((searchResultsWithTotalCount) => {
          const { results, total_count } = searchResultsWithTotalCount;

          _setSearchResults(results);
          _setTotalSearchResults(total_count);
        });
    }
  }, [searchQuery, page, pageSize, resetSearch]);

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
