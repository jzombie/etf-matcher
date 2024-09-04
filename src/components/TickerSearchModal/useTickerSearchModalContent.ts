import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import store from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useTickerSearch from "@hooks/useTickerSearch";

import { fetchTickerDetail } from "@utils/callRustService";
import type { RustServiceTickerSearchResult } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

export type TickerSearchModalContentProps = {
  isSearchModalOpen: boolean;
};

type TickerSearchModalResultsMode =
  | "ticker_search_results"
  | "recently_viewed"
  | "ticker_tape";

type TickerSearchModalResultsResponse = {
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
}: TickerSearchModalContentProps): TickerSearchModalResultsResponse {
  const { triggerUIError } = useAppErrorBoundary();

  const [altSearchResults, setAltSearchResults] = useState<
    RustServiceTickerSearchResult[]
  >([]);
  const [altSelectedIndex, setAltSelectedIndex] = useState<number>(-1);

  const [resultsMode, setResultsMode] = useState<TickerSearchModalResultsMode>(
    "ticker_search_results",
  );

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

  useEffect(() => {
    if (!isSearchModalOpen || tickerSearchQuery.trim().length) {
      // Reset selected index and results mode when the search query is present or modal is closed
      setAltSelectedIndex(-1);
      setResultsMode("ticker_search_results");
      return;
    }

    const recentlyViewedBucket =
      store.getFirstTickerBucketOfType("recently_viewed");
    let altResultsBucket = recentlyViewedBucket;

    if (recentlyViewedBucket?.tickers.length) {
      setResultsMode("recently_viewed");
    } else {
      const tickerTapeBucket = store.getFirstTickerBucketOfType("ticker_tape");
      altResultsBucket = tickerTapeBucket;
      setResultsMode("ticker_tape");
    }

    if (altResultsBucket?.tickers.length) {
      Promise.allSettled(
        altResultsBucket.tickers.map((ticker) =>
          fetchTickerDetail(ticker.tickerId),
        ),
      )
        .then((settledDetails) => {
          const altSearchResults: RustServiceTickerSearchResult[] =
            settledDetails
              .filter((result) => result.status === "fulfilled")
              .map((result) => ({
                ticker_id: result.value.ticker_id,
                symbol: result.value.symbol,
                exchange_short_name: result.value.exchange_short_name,
                company_name: result.value.company_name,
                logo_filename: result.value.logo_filename,
              }));

          setAltSearchResults(altSearchResults);
        })
        .catch((error) => {
          triggerUIError(new Error("Error fetching ticker details"));
          customLogger.error("Error fetching ticker details:", error);
        });
    }
  }, [
    isSearchModalOpen,
    tickerSearchQuery,
    setAltSearchResults,
    setAltSelectedIndex,
    setResultsMode,
    triggerUIError,
  ]);

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
  } = useMemo<Omit<TickerSearchModalResultsResponse, "resultsMode">>(() => {
    const common = {
      searchQuery: tickerSearchQuery,
      setSearchQuery: setTickerSearchQuery,
    };

    if (resultsMode !== "ticker_search_results") {
      return {
        ...common,
        searchResults: altSearchResults,
        setSelectedIndex: setAltSelectedIndex,
        selectedIndex: altSelectedIndex,
        totalSearchResults: altSearchResults.length,
        page: 1,
        setPage: () => {}, // no-op
        pageSize: altSearchResults.length,
        totalPages: 1,
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
    };
  }, [
    tickerSearchQuery,
    setTickerSearchQuery,
    resultsMode,
    tickerSearchResults,
    setTickerSearchSelectedIndex,
    tickerSearchSelectedIndex,
    totalTickerSearchResults,
    tickerResultsPage,
    setTickerResultsPage,
    setTickerResultsPageSize,
    totalTickerResultsPages,
    altSearchResults,
    altSelectedIndex,
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
