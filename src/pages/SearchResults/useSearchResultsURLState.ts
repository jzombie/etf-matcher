import { useCallback } from "react";

import useURLState from "@hooks/useURLState";

import useSearch from "@hooks/useSearch";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function useSearchResultsURLState() {
  const {
    searchQuery,
    setSearchQuery: _setSearchQuery,
    setOnlyExactMatches: _setOnlyExactMatches,
    setPage: _setPage,
    ...rest
  } = useSearch();

  usePageTitleSetter(searchQuery ? `Search results for: ${searchQuery}` : null);

  const { setURLState, getBooleanParam, toBooleanParam } = useURLState<{
    query: string | null;
    page: string | null;
    exact: string | null;
  }>((urlState) => {
    const { query, page } = urlState;

    if (query) {
      _setSearchQuery(query.trim());
    }

    _setOnlyExactMatches(getBooleanParam("exact", true));

    _setPage(!page ? 1 : parseInt(page, 10));
  });

  const toggleExactMatch = useCallback(() => {
    setURLState(() => ({
      // Don't log `exact=true`
      exact: toBooleanParam(
        // First, take the inverse of the `exact` parameter (defaulting to `true`)
        !getBooleanParam("exact", true),
        // Then, apply `true` default to remove it from the URL if `true`
        true
      ),
      // Reset page on change
      page: null,
    }));
  }, [setURLState, getBooleanParam, toBooleanParam]);

  const setPage = useCallback(
    (page: number) => {
      setURLState({ page: page > 1 ? page.toString() : null });
    },
    [setURLState]
  );

  return {
    searchQuery,
    toggleExactMatch,
    setPage,
    ...rest,
  };
}
