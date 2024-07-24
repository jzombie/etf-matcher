import React, { useCallback, useMemo } from "react";
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
import SymbolDetailList from "@components/TickerDetailList";
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

  const { setURLState, getBooleanParam, toBooleanParam } = useURLState<{
    query: string | null;
    page: string | null;
    exact: string | null;
  }>((urlState) => {
    const { query, page } = urlState;

    if (query) {
      _setSearchQuery(query.trim());
    }

    _setOnlyExactMatches(getBooleanParam("exact"));

    _setPage(!page ? 1 : parseInt(page, 10));
  });

  const toggleExactMatch = useCallback(() => {
    setURLState(() => ({
      // Don't log `exact=true`
      exact: toBooleanParam(!getBooleanParam("exact"), false),
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

  usePageTitleSetter(searchQuery ? `Search results for: ${searchQuery}` : null);

  const tickerIds = useMemo(
    () => searchResults.map(({ ticker_id }) => ticker_id),
    [searchResults]
  );

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
        {
          // TODO: Rename to `TickerDetailList`
        }
        <SymbolDetailList tickerIds={tickerIds} />
      </Transition>

      {totalSearchResults > pageSize && !isLoading && (
        <Box style={{ textAlign: "center" }}>
          <Pagination
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
