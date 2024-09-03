import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import store from "@src/store";

import useTickerSearch from "@hooks/useTickerSearch";

import { fetchTickerDetail } from "@utils/callRustService";
import type { RustServiceTickerSearchResult } from "@utils/callRustService";

export type TickerSearchModalContentProps = {
  isSearchModalOpen: boolean;
};

// TODO: Rename accordingly
type TickerSearchModalResultsMode = "ticker-search-results" | "bucket-view";

// TODO: Rename accordingly
type TickerSearchModalContentResponse = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: RustServiceTickerSearchResult[];
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  selectedIndex: number;
  totalSearchResults: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  resultsMode: TickerSearchModalResultsMode;
};

export default function useTickerSearchModalContent({
  isSearchModalOpen,
}: TickerSearchModalContentProps): TickerSearchModalContentResponse {
  const [recentlyViewedSearchResults, setRecentlyViewedSearchResults] =
    useState<RustServiceTickerSearchResult[]>([]);
  const [recentlyViewedSelectedIndex, setRecentlyViewedSelectedIndex] =
    useState<number>(-1);

  const {
    searchQuery: tickerSearchQuery,
    setSearchQuery: setTickerSearchQuery,
    searchResults: tickerSearchResults,
    setSelectedIndex: setTickerSearchSelectedIndex,
    selectedIndex: tickerSearchSelectedIndex,
    totalSearchResults: totalTickerSearchResults,
    page: tickerResultsPage,
    setPage: setTickerResultsPage,
    pageSize: setTickerResultsPageSize,
    totalPages: totalTickerResultsPages,
  } = useTickerSearch({
    initialPageSize: 10,
  });

  // TODO: Adapt so this can query different ticker buckets
  useEffect(() => {
    if (isSearchModalOpen && !tickerSearchQuery.trim().length) {
      const recentlyViewed =
        store.getFirstTickerBucketOfType("recently_viewed");

      const resultsPromise =
        recentlyViewed?.tickers &&
        Promise.allSettled(
          recentlyViewed.tickers.map((ticker) =>
            fetchTickerDetail(ticker.tickerId),
          ),
        );

      resultsPromise?.then((settledDetails) => {
        const fulfilledDetails = settledDetails
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);

        const recentlyViewedSearchResults: RustServiceTickerSearchResult[] =
          fulfilledDetails.map((tickerDetail) => ({
            ticker_id: tickerDetail.ticker_id,
            symbol: tickerDetail.symbol,
            exchange_short_name: tickerDetail.exchange_short_name,
            company_name: tickerDetail.company_name,
            logo_filename: tickerDetail.logo_filename,
          }));

        setRecentlyViewedSearchResults(recentlyViewedSearchResults);
      });
    } else {
      // Reset selected index
      setRecentlyViewedSelectedIndex(-1);
    }
  }, [isSearchModalOpen, tickerSearchQuery]);

  // Output adapter
  const {
    searchResults,
    setSelectedIndex,
    selectedIndex,
    totalSearchResults,
    page,
    setPage,
    pageSize,
    totalPages,
    resultsMode,
  } = useMemo<TickerSearchModalContentResponse>(() => {
    const common = {
      searchQuery: tickerSearchQuery,
      setSearchQuery: setTickerSearchQuery,
    };

    if (!tickerSearchQuery.trim().length) {
      return {
        ...common,
        searchResults: recentlyViewedSearchResults,
        setSelectedIndex: setRecentlyViewedSelectedIndex,
        selectedIndex: recentlyViewedSelectedIndex,
        totalSearchResults: recentlyViewedSearchResults.length,
        page: 1,
        setPage: () => {}, // no-op
        pageSize: recentlyViewedSearchResults.length,
        totalPages: 1,
        resultsMode: "bucket-view",
      };
    }

    return {
      ...common,
      searchResults: tickerSearchResults,
      setSelectedIndex: setTickerSearchSelectedIndex,
      selectedIndex: tickerSearchSelectedIndex,
      totalSearchResults: totalTickerSearchResults,
      page: tickerResultsPage,
      setPage: setTickerResultsPage,
      pageSize: setTickerResultsPageSize,
      totalPages: totalTickerResultsPages,
      resultsMode: "ticker-search-results",
    };
  }, [
    tickerSearchQuery,
    setTickerSearchQuery,
    tickerSearchResults,
    setTickerSearchSelectedIndex,
    tickerSearchSelectedIndex,
    totalTickerSearchResults,
    tickerResultsPage,
    setTickerResultsPage,
    setTickerResultsPageSize,
    totalTickerResultsPages,
    recentlyViewedSearchResults,
    recentlyViewedSelectedIndex,
  ]);

  return {
    searchQuery: tickerSearchQuery,
    setSearchQuery: setTickerSearchQuery,
    searchResults,
    setSelectedIndex,
    selectedIndex,
    totalSearchResults,
    page,
    setPage,
    pageSize,
    totalPages,
    resultsMode,
  };
}
