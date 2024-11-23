import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  Box,
  Button,
  FormControlLabel,
  Pagination,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";
import type { RustServiceTickerSearchResult } from "@services/RustService";

import AvatarLogo from "@components/AvatarLogo";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import SearchModalButton from "@components/SearchModalButton";
import SelectableGrid from "@components/SelectableGrid";
import TickerViewWindowManager from "@components/TickerViewWindowManager";
import Transition from "@components/Transition";

import usePageTitleSetter from "@hooks/usePageTitleSetter";
import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

import useSearchResultsURLState from "./hooks/useSearchResultsURLState";

export default function SearchResultsPage() {
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

  const pageTitle = useMemo<string | null>(() => {
    if (!searchQuery) {
      return null;
    }

    if (!onlyExactMatches || searchResults.length !== 1) {
      return `Search results for: ${searchQuery}`;
    } else {
      return searchQuery;
    }
  }, [searchQuery, searchResults, onlyExactMatches]);

  usePageTitleSetter(pageTitle);

  const headerRef = useRef<HTMLDivElement>(null);
  const navigateToSymbol = useTickerSymbolNavigation();

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      const scrollTop = event.currentTarget.scrollTop;
      const headerHeight = headerRef.current.clientHeight;
      const newMarginTop = Math.max(-headerHeight, -scrollTop);
      headerRef.current.style.marginTop = `${newMarginTop}px`;
    }
  }, []);

  // Reset header offset on page changes
  useEffect(() => {
    const header = headerRef.current;
    if (page && header) {
      header.style.marginTop = "0px";
    }
  }, [page]);

  const isHeaderPaginationInline = useMediaQuery("@media (min-width:800px)");

  // Map search results to the format needed for SelectableGrid
  const selectableSearchResults = useMemo(
    () =>
      searchResults.map((result) => ({
        data: result,
        id: result.ticker_id,
      })),
    [searchResults],
  );

  // Render each search result item for the grid
  const renderSearchResultItem = useCallback(
    (searchResult: RustServiceTickerSearchResult) => (
      <Box
        display="flex"
        alignItems="center"
        padding={1}
        sx={{
          whiteSpace: "nowrap", // Prevents text from wrapping
          overflow: "hidden", // Hides overflowing content
          textOverflow: "ellipsis", // Adds an ellipsis if the text overflows
        }}
      >
        <AvatarLogo tickerDetail={searchResult} />
        <Box ml={2} sx={{ minWidth: 0 }}>
          {" "}
          {/* Ensure this box can shrink */}
          <Typography variant="h6" noWrap>
            {searchResult.symbol}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            {searchResult.company_name}
          </Typography>
        </Box>
      </Box>
    ),
    [],
  );

  if (!searchResults.length) {
    if (isLoading) {
      return (
        <Center>
          <NetworkProgressIndicator />
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
      {
        // TODO: Depending on the amount of available vertical space, consider
        // hiding header if exact match is enabled and the user is viewing a symbol
      }
      <Header ref={headerRef}>
        <Padding half>
          <Box
            display="flex"
            alignItems="center"
            justifyContent={
              isHeaderPaginationInline ? "space-between" : "space-between"
            }
            flexDirection={isHeaderPaginationInline ? "row" : "column"}
            sx={{ height: "100%" }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent={
                isHeaderPaginationInline ? "flex-start" : "space-between"
              }
              width={isHeaderPaginationInline ? "auto" : "100%"}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyExactMatches}
                    onChange={toggleExactMatch}
                  />
                }
                label={
                  <Typography variant="body2" color="textSecondary">
                    Toggle Exact Match
                  </Typography>
                }
              />
              <Typography
                variant="body2"
                sx={{
                  marginLeft: isHeaderPaginationInline ? 2 : 0,
                  textAlign: isHeaderPaginationInline ? "left" : "center",
                }}
              >
                {formatNumberWithCommas(totalSearchResults)} search result
                {totalSearchResults !== 1 ? "s" : ""} for &quot;{searchQuery}
                &quot;
              </Typography>
            </Box>
            {totalSearchResults > pageSize && (
              <Box
                mt={isHeaderPaginationInline ? 0 : 0.4}
                textAlign={isHeaderPaginationInline ? "right" : "center"}
              >
                <Pagination
                  disabled={isLoading}
                  count={totalPages}
                  page={page}
                  onChange={(event, nextPage) => setPage(nextPage)}
                  showFirstButton
                  showLastButton
                  sx={{ whiteSpace: "no-wrap" }}
                  // TODO: Dynamically adjust the following as needed
                  // boundaryCount={0}
                  // siblingCount={0}
                />
              </Box>
            )}
          </Box>
        </Padding>
      </Header>
      <Content>
        <Transition
          direction={!previousPage || page > previousPage ? "left" : "right"}
          trigger={searchResults}
        >
          {searchResults.length === 1 && onlyExactMatches ? (
            <TickerViewWindowManager tickerId={searchResults[0].ticker_id} />
          ) : (
            <Scrollable onScroll={handleScroll}>
              <Padding>
                <SelectableGrid
                  items={selectableSearchResults}
                  onItemSelect={(searchResult) =>
                    navigateToSymbol(searchResult.symbol)
                  }
                  renderItem={renderSearchResultItem}
                />
              </Padding>
            </Scrollable>
          )}
        </Transition>
      </Content>
    </Layout>
  );
}
