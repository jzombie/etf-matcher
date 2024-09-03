import { useEffect, useMemo, useState } from "react";

import store from "@src/store";

import useTickerSearch from "@hooks/useTickerSearch";

import { fetchTickerDetail } from "@utils/callRustService";
import type { RustServiceTickerSearchResult } from "@utils/callRustService";

export type TickerSearchModalContentProps = {
  isSearchModalOpen: boolean;
};

export default function useTickerSearchModalContent({
  isSearchModalOpen,
}: TickerSearchModalContentProps) {
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
  } = useMemo(() => {
    if (!tickerSearchQuery.trim().length) {
      return {
        searchResults: recentlyViewedSearchResults,
        setSelectedIndex: setRecentlyViewedSelectedIndex,
        selectedIndex: recentlyViewedSelectedIndex,
        totalSearchResults: recentlyViewedSearchResults.length,
        page: 1,
        setPage: () => null,
        pageSize: recentlyViewedSearchResults.length,
        totalPages: 1,
      };
    }

    return {
      searchResults: tickerSearchResults,
      setSelectedIndex: setTickerSearchSelectedIndex,
      selectedIndex: tickerSearchSelectedIndex,
      totalSearchResults: totalTickerSearchResults,
      page: tickerResultsPage,
      setPage: setTickerResultsPage,
      pageSize: setTickerResultsPageSize,
      totalPages: totalTickerResultsPages,
    };
  }, [
    tickerSearchQuery,
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

  // TODO: Also return `mode` to show which type of results are being used

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
  };
}
