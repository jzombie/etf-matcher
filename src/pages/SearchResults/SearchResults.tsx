import React, { useCallback, useRef } from "react";

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
import Layout, { Content, Header } from "@layoutKit/Layout";
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

  const headerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    // TODO: On large enough viewports, discard this

    if (headerRef.current) {
      const scrollTop = event.currentTarget.scrollTop;
      const headerHeight = headerRef.current.clientHeight;

      // Calculate the new margin top to slide the header out of view
      // Stop decreasing marginTop once the header is fully out of view
      const newMarginTop = Math.max(-headerHeight, -scrollTop);

      // Apply the calculated margin top to the header
      headerRef.current.style.marginTop = `${newMarginTop}px`;
    }
  }, []);

  if (!searchResults.length) {
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
    <Layout>
      <Header ref={headerRef}>
        <Padding>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ height: "100%" }}
          >
            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyExactMatches}
                    onChange={toggleExactMatch}
                  />
                }
                label={
                  <Typography variant="body1" color="textSecondary">
                    Toggle Exact Match
                  </Typography>
                }
              />
            </Box>
            <Box>
              <Typography variant="body1">
                {totalSearchResults} search result
                {totalSearchResults !== 1 ? "s" : ""} for "{searchQuery}"
              </Typography>
            </Box>
            {totalSearchResults > pageSize && (
              <Pagination
                disabled={false}
                count={totalPages}
                page={page}
                onChange={(event, nextPage) => setPage(nextPage)}
                showFirstButton
                showLastButton
              />
            )}
          </Box>
        </Padding>
      </Header>
      <Content>
        <Transition
          direction={!previousPage || page > previousPage ? "left" : "right"}
          trigger={searchResults}
        >
          <Scrollable onScroll={handleScroll}>
            <TickerDetailList
              tickerIds={searchResults.map(({ ticker_id }) => ticker_id)}
            />
          </Scrollable>
        </Transition>
      </Content>
    </Layout>
  );
}
