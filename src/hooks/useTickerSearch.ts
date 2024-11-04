import { useCallback, useEffect, useMemo, useState } from "react";

import type { RustServiceTickerSearchResult } from "@services/RustService";
import { searchTickers } from "@services/RustService";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import customLogger from "@utils/customLogger";

import usePagination from "./usePagination";
import usePromise from "./usePromise";

export type TickerSearchProps = {
  initialQuery?: string;
  initialOnlyExactMatches: boolean;
  initialPage?: number;
  initialPageSize?: number;
  initialSelectedIndex?: number;
};

const DEFAULT_PROPS: Required<TickerSearchProps> = {
  initialQuery: "",
  initialOnlyExactMatches: false,
  initialPage: 1,
  initialPageSize: 20,
  initialSelectedIndex: -1,
};

export default function useTickerSearch(
  props: Partial<TickerSearchProps> = DEFAULT_PROPS,
) {
  const { triggerUIError } = useAppErrorBoundary();

  const mergedProps: Required<TickerSearchProps> = useMemo(
    () => ({ ...DEFAULT_PROPS, ...props }),
    [props],
  );

  const [searchQuery, _setSearchQuery] = useState<string>(
    mergedProps.initialQuery,
  );
  const [onlyExactMatches, setOnlyExactMatches] = useState<boolean>(
    mergedProps.initialOnlyExactMatches,
  );

  const [searchResults, _setSearchResults] = useState<
    RustServiceTickerSearchResult[]
  >([]);
  const [totalSearchResults, _setTotalSearchResults] = useState<number>(0);

  const {
    page,
    previousPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    remaining,
    resetPagination,
  } = usePagination({
    initialPage: mergedProps.initialPage,
    initialPageSize: mergedProps.initialPageSize,
    totalItems: totalSearchResults,
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(
    mergedProps.initialSelectedIndex,
  );

  const resetSearch = useCallback(() => {
    _setSearchQuery("");
    _setSearchResults([]);
    _setTotalSearchResults(0);
    resetPagination();
    setSelectedIndex(DEFAULT_PROPS.initialSelectedIndex);
  }, [resetPagination]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    _setSearchQuery(searchQuery.toUpperCase());
  }, []);

  const {
    isPending: isLoading,
    error: tickerSearchError,
    execute: handleSearchTickers,
  } = usePromise<
    {
      results: RustServiceTickerSearchResult[];
      total_count: number;
    },
    [
      {
        searchQuery: string;
        page: number;
        pageSize: number;
        onlyExactMatches: boolean;
      },
    ]
  >({
    fn: ({ searchQuery, page, pageSize, onlyExactMatches }) => {
      return searchQuery
        ? searchTickers(searchQuery, page, pageSize, onlyExactMatches)
        : Promise.resolve({ results: [], total_count: 0 });
    },
    autoExecute: false,
    onLoad: ({ results, total_count }) => {
      _setSearchResults(results);
      _setTotalSearchResults(total_count);
      setSelectedIndex(DEFAULT_PROPS.initialSelectedIndex);
    },
    onError: (err) => {
      triggerUIError(new Error("Error when searching tickers"));
      customLogger.error("Caught error when searching tickers", err);
    },
  });

  // Perform auto-search or auto-reset, based on the search parameters
  useEffect(() => {
    if (!searchQuery.trim().length) {
      resetSearch();
    } else {
      handleSearchTickers({ searchQuery, page, pageSize, onlyExactMatches });
    }
  }, [
    searchQuery,
    page,
    pageSize,
    resetSearch,
    onlyExactMatches,
    handleSearchTickers,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    onlyExactMatches,
    setOnlyExactMatches,
    searchResults,
    totalSearchResults,
    selectedIndex,
    setSelectedIndex,
    page,
    previousPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    remaining,
    resetSearch,
    isLoading,
    tickerSearchError,
  };
}
