import React, { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Pagination,
} from "@mui/material";

import SearchModalButton from "@components/SearchModalButton";
import useSearch from "@hooks/useSearch";
import SymbolDetailList from "@components/SymbolDetailList";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery: _setSearchQuery,
    onlyExactMatches,
    setOnlyExactMatches: _setOnlyExactMatches,
    searchResults,
    totalSearchResults,
    pageSize,
    page,
    setPage: _setPage,
    totalPages,
  } = useSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.forEach((value, key) => {
      if (key === "query") {
        _setSearchQuery(value.trim());
      }
      if (key === "exact") {
        _setOnlyExactMatches(value === "true" || value === "1");
      } else {
        _setOnlyExactMatches(false);
      }
      if (key === "page") {
        _setPage(parseInt(value, 10));
      }
    });
  }, [location, _setSearchQuery, _setOnlyExactMatches, _setPage]);

  const toggleExactMatch = () => {
    const searchParams = new URLSearchParams(location.search);
    const newExactValue = !(searchParams.get("exact") === "true");

    if (newExactValue) {
      searchParams.set("exact", "true");
    } else {
      searchParams.delete("exact");
    }

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    _setOnlyExactMatches(newExactValue);
    _setPage(1);
  };

  const setPage = useCallback(
    (page: number) => {
      const searchParams = new URLSearchParams(location.search);

      if (page > 1) {
        searchParams.set("page", page.toString());
      } else {
        searchParams.delete("page");
      }

      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
    },
    [location, navigate]
  );

  const searchResultSymbols = useMemo(
    () => searchResults.map((searchResult) => searchResult.symbol),
    [searchResults]
  );

  usePageTitleSetter(searchQuery ? `Search results for: ${searchQuery}` : null);

  // Reset the scrollbar position on search query updates
  const scrollableKey = useMemo(
    () => JSON.stringify({ searchQuery, onlyExactMatches, page }),
    [searchQuery, onlyExactMatches, page]
  );

  if (!searchResultSymbols.length) {
    return (
      <Center>
        <Typography variant="h6" fontWeight="bold">
          {!searchQuery.length ? (
            <>No search query defined.</>
          ) : (
            <>
              No {onlyExactMatches && "exact"} search results for &quot;
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
    <Scrollable key={scrollableKey}>
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
        <Box sx={{ textAlign: "center" }}>
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
      <SymbolDetailList tickerSymbols={searchResultSymbols} />
      {totalSearchResults > pageSize && (
        <Box sx={{ textAlign: "center" }}>
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
