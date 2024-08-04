import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  FormControlLabel,
  Pagination,
  Switch,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import SearchModalButton from "@components/SearchModalButton";
import TickerDetailList from "@components/TickerDetailList";
import Transition from "@components/Transition";

import usePageTitleSetter from "@utils/usePageTitleSetter";

import useSearchResultsURLState from "./useSearchResultsURLState";

export default function SearchResults() {
  const {
    searchQuery,
    searchResults,
    isLoading,
    onlyExactMatches,
    toggleExactMatch,
    totalSearchResults,
    page,
    setPage,
    pageSize,
    totalPages,
    previousPage,
  } = useSearchResultsURLState();

  usePageTitleSetter(searchQuery ? `Search results for: ${searchQuery}` : null);

  const searchResultSymbols = useMemo(
    () => searchResults.map((searchResult) => searchResult.symbol),
    [searchResults],
  );

  const tickerIds = useMemo(
    () => searchResults.map(({ ticker_id }) => ticker_id),
    [searchResults],
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
        {totalSearchResults}
        {onlyExactMatches ? " exact" : ""} search result
        {totalSearchResults !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
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
