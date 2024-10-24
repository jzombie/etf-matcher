import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RustServiceTickerSearchResult } from "@services/RustService";
import { searchTickers } from "@services/RustService";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";

import usePagination from "./usePagination";

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

  const [tickerSearchError, _setTickerSearchError] = useState<Error | unknown>(
    null,
  );

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

  const [isLoading, _setisLoading] = useState<boolean>(false);

  const resetSearch = useCallback(() => {
    _setisLoading(false);
    _setSearchQuery("");
    _setSearchResults([]);
    _setTotalSearchResults(0);
    resetPagination();
    setSelectedIndex(DEFAULT_PROPS.initialSelectedIndex);
  }, [resetPagination]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    _setSearchQuery(searchQuery.toUpperCase());
  }, []);

  const previousSearchQueryRef = useRef(searchQuery);

  // Perform search or reset
  useEffect(() => {
    if (!searchQuery.trim().length) {
      resetSearch();
    } else {
      const previousSearchQuery = previousSearchQueryRef.current;

      let activePage = page;
      if (
        previousSearchQuery &&
        searchQuery.trim() !== previousSearchQuery.trim()
      ) {
        activePage = DEFAULT_PROPS.initialPage;
      }

      _setisLoading(true);
      _setTickerSearchError(null);

      // The `debouncedSearch` helps prevent potential infinite loop errors that can be
      // caused by the user rapidly paginating through results. Usage of the AbortController
      // AbortSignal didn't seem to alleviate this.
      const debouncedSearch = debounceWithKey(
        "use_search:search_tickers",
        () => {
          searchTickers(searchQuery, activePage, pageSize, onlyExactMatches)
            .then((searchResultsWithTotalCount) => {
              const { results, total_count } = searchResultsWithTotalCount;

              _setSearchResults(results);
              _setTotalSearchResults(total_count);
              setPage(activePage);
              setSelectedIndex(DEFAULT_PROPS.initialSelectedIndex);
            })
            .catch((err) => {
              triggerUIError(new Error("Error when searching tickers"));
              customLogger.error("Caught error when searching tickers", err);
            })
            .finally(() => {
              _setisLoading(false);
            });
        },
        50,
      );

      previousSearchQueryRef.current = searchQuery;

      return () => {
        debouncedSearch.clear();
      };
    }
  }, [
    searchQuery,
    page,
    pageSize,
    resetSearch,
    onlyExactMatches,
    setPage,
    triggerUIError,
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
