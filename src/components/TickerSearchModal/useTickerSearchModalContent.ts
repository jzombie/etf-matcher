import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import store from "@src/store";

import useTickerSearch from "@hooks/useTickerSearch";

import { fetchTickerDetail } from "@utils/callRustService";
import type { RustServiceTickerSearchResult } from "@utils/callRustService";

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

  // TODO: Adapt so this can query different ticker buckets
  useEffect(() => {
    if (isSearchModalOpen && !tickerSearchQuery.trim().length) {
      const recentlyViewed =
        store.getFirstTickerBucketOfType("recently_viewed");

      setResultsMode("recently_viewed");

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

        const altSearchResults: RustServiceTickerSearchResult[] =
          fulfilledDetails.map((tickerDetail) => ({
            ticker_id: tickerDetail.ticker_id,
            symbol: tickerDetail.symbol,
            exchange_short_name: tickerDetail.exchange_short_name,
            company_name: tickerDetail.company_name,
            logo_filename: tickerDetail.logo_filename,
          }));

        setAltSearchResults(altSearchResults);
      });
    } else {
      // Reset selected index
      setAltSelectedIndex(-1);

      setResultsMode("ticker_search_results");
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
