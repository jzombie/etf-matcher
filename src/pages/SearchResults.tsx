import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Pagination,
} from "@mui/material";

import useURLState from "@hooks/useURLState";

import SearchModalButton from "@components/SearchModalButton";
import TickerDetailList from "@components/TickerDetailList";
import Transition from "@components/Transition";

import useSearch from "@hooks/useSearch";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import usePageTitleSetter from "@utils/usePageTitleSetter";

import CircularProgress from "@mui/material/CircularProgress";

export default function SearchResults() {
  const {
    searchQuery,
    setSearchQuery: _setSearchQuery,
    onlyExactMatches,
    setOnlyExactMatches: _setOnlyExactMatches,
    searchResults,
    totalSearchResults,
    pageSize,
    page,
    previousPage,
    setPage: _setPage,
    totalPages,
    isLoading,
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

  const searchResultSymbols = useMemo(
    () => searchResults.map((searchResult) => searchResult.symbol),
    [searchResults]
  );

  const tickerIds = useMemo(
    () => searchResults.map(({ ticker_id }) => ticker_id),
    [searchResults]
  );

  // Note: This `useState`/`useEffect` combination is intended to hide the second
  // `Pagination` component so that it doesn't show doubled-up while it is still loading.
  const [isTickerDetailListLoading, setIsTickerDetailListLoading] =
    useState<boolean>(false);
  useEffect(() => {
    if (tickerIds) {
      setIsTickerDetailListLoading(true);
    }
  }, [tickerIds]);

  if (!searchResultSymbols.length) {
    if (isLoading) {
      return (
        <Center>
          <CircularProgress />
        </Center>
      );
    }

    return (
      <Center>
        <Typography variant="h6" fontWeight="bold">
          {!searchQuery.length ? (
            <>No search query defined.</>
          ) : (
            <>
              No {onlyExactMatches && "exact symbol"} search results for &quot;
              {searchQuery}&quot;
            </>
          )}
        </Typography>

        <Box mt={4}>
          <Typography
            variant="body1"
            sx={{ display: "inline-block", marginRight: 1 }}
          >
            Try another
          </Typography>

          <SearchModalButton />
        </Box>

        {onlyExactMatches && (
          <Box mt={4}>
            <Typography
              variant="body1"
              sx={{ display: "inline-block", marginRight: 1 }}
            >
              Or
            </Typography>
            <Button variant="contained" onClick={toggleExactMatch}>
              Disable Exact Matches
            </Button>
          </Box>
        )}
      </Center>
    );
  }

  return (
    <Scrollable resetTrigger={searchResultSymbols}>
      <Padding>
        <Box
          display="flex"
          alignItems="center"
          sx={{ display: "inline-block" }}
        >
          <FormControlLabel
            control={
              <Switch checked={onlyExactMatches} onChange={toggleExactMatch} />
            }
            label={
              <Typography variant="body1" color="textSecondary">
                Toggle Exact Match
              </Typography>
            }
          />
        </Box>
        {totalSearchResults} search result{totalSearchResults !== 1 ? "s" : ""}{" "}
        for &quot;{searchQuery}&quot;
      </Padding>
      {totalSearchResults > pageSize && (
        <Box style={{ textAlign: "center" }}>
          <Pagination
            disabled={isTickerDetailListLoading}
            count={totalPages}
            page={page}
            onChange={(event, nextPage) => setPage(nextPage)}
            showFirstButton
            showLastButton
            sx={{ display: "inline-block" }}
          />
        </Box>
      )}
      <Transition
        direction={!previousPage || page > previousPage ? "left" : "right"}
        trigger={searchResultSymbols}
      >
        <TickerDetailList
          tickerIds={tickerIds}
          onLoad={() => setIsTickerDetailListLoading(false)}
        />
      </Transition>

      {!isTickerDetailListLoading &&
        totalSearchResults > pageSize &&
        !isLoading && (
          <Box style={{ textAlign: "center" }}>
            <Pagination
              disabled={isTickerDetailListLoading}
              count={totalPages}
              page={page}
              onChange={(event, nextPage) => setPage(nextPage)}
              showFirstButton
              showLastButton
              sx={{ display: "inline-block" }}
            />
          </Box>
        )}
    </Scrollable>
  );
}
