import React, {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
  RustServiceTickerSearchResult,
} from "@services/RustService";
import store, { TickerBucket, TickerBucketTicker } from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import useMultiETFAggregateDetail from "@hooks/useMultiETFAggregateDetail";
import useMultiTickerDetail from "@hooks/useMultiTickerDetail";
import useNotification from "@hooks/useNotification";
import useStoreStateReader from "@hooks/useStoreStateReader";
import useTickerVectorAudit from "@hooks/useTickerVectorAudit";

import customLogger from "@utils/customLogger";
import deepEqual from "@utils/deepEqual";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

export type TickerSelectionManagerContextType = {
  selectedTickerIds: number[];
  selectTickerId: (tickerId: number) => void;
  deselectTickerId: (tickerId: number) => void;
  selectAllTickerIds: () => void;
  clearSelectedTickerIds: () => void;
  areAllTickersSelected: boolean;
  areNoTickersSelected: boolean;
  adjustTicker: (adjustedTicker: TickerBucketTicker) => void;
  addSearchResultTicker: (
    searchResultTicker: RustServiceTickerSearchResult,
  ) => void;
  removeTickerWithId: (tickerId: number) => void;
  adjustedTickerBucket: TickerBucket;
  // `filteredTickerBucket` is the `adjustedTickerBucket` with deselected tickers filtered out
  filteredTickerBucket: TickerBucket;
  saveTickerBucket: () => void;
  cancelTickerAdjustments: () => void;
  isTickerBucketSaved: boolean;
  //
  isLoadingAdjustedTickerDetails: boolean;
  adjustedTickerDetails: RustServiceTickerDetail[] | null;
  adjustedTickerDetailsError: Error | null;
  isLoadingAdjustedETFAggregateDetails: boolean;
  adjustedETFAggregateDetails: RustServiceETFAggregateDetail[] | null;
  adjustedETFAggregateDetailsError: Error | null;
  formattedAdjustedSymbolsWithExchange?: string[] | null;
  //
  missingAuditedTickerVectorIds?: number[] | null;
  isTickerVectorAuditPending: boolean;
  //
  forceRefreshIndex: number;
};

// Set up the default value with empty functions and an empty array for selected tickers
const DEFAULT_CONTEXT_VALUE: TickerSelectionManagerContextType = {
  selectedTickerIds: [],
  selectTickerId: () => {},
  deselectTickerId: () => {},
  selectAllTickerIds: () => {},
  clearSelectedTickerIds: () => {},
  areAllTickersSelected: true,
  areNoTickersSelected: false,
  adjustTicker: () => {},
  addSearchResultTicker: () => {},
  removeTickerWithId: () => {},
  adjustedTickerBucket: {
    uuid: "N/A",
    name: "N/A",
    tickers: [],
    type: "watchlist",
    description: "N/A",
    isUserConfigurable: true,
  },
  filteredTickerBucket: {
    uuid: "N/A",
    name: "N/A",
    tickers: [],
    type: "watchlist",
    description: "N/A",
    isUserConfigurable: true,
  },
  saveTickerBucket: () => {},
  cancelTickerAdjustments: () => {},
  isTickerBucketSaved: true,
  //
  isLoadingAdjustedTickerDetails: false,
  adjustedTickerDetails: null,
  adjustedTickerDetailsError: null,
  isLoadingAdjustedETFAggregateDetails: false,
  adjustedETFAggregateDetails: null,
  adjustedETFAggregateDetailsError: null,
  formattedAdjustedSymbolsWithExchange: null,
  //
  missingAuditedTickerVectorIds: null,
  isTickerVectorAuditPending: false,
  //
  forceRefreshIndex: 0,
};

// Create the context with the specified type and default value
export const TickerSelectionManagerContext =
  createContext<TickerSelectionManagerContextType>(DEFAULT_CONTEXT_VALUE);

export type TickerSelectionManagerProviderProps = {
  children: ReactNode;
  tickerBucket: TickerBucket;
};

export default function TickerSelectionManagerProvider({
  children,
  tickerBucket,
}: TickerSelectionManagerProviderProps) {
  const { preferredTickerVectorConfigKey } = useStoreStateReader(
    "preferredTickerVectorConfigKey",
  );

  const { showNotification } = useNotification();
  const { triggerUIError } = useAppErrorBoundary();

  const [forceRefreshIndex, setForceRefreshIndex] = useState<number>(0);

  const forceRefresh = useCallback(() => {
    setForceRefreshIndex((prev) => ++prev);
  }, []);

  const [selectedTickerIds, setSelectedTickerIds] = useState<number[]>(() =>
    tickerBucket.tickers.map((ticker) => ticker.tickerId),
  );

  const [adjustedTickerBucket, setAdjustedTickerBucket] =
    useState<TickerBucket>(tickerBucket);

  const adjustedTickerIds = useMemo(
    () => adjustedTickerBucket.tickers.map((ticker) => ticker.tickerId),
    [adjustedTickerBucket],
  );
  const {
    isLoading: isLoadingAdjustedTickerDetails,
    multiTickerDetails: adjustedTickerDetails,
    error: adjustedTickerDetailsError,
  } = useMultiTickerDetail(adjustedTickerIds);

  const adjustedETFTickerIds = useMemo(
    () =>
      adjustedTickerDetails
        ?.filter((ticker) => ticker.is_etf)
        .map((ticker) => ticker.ticker_id) || [],
    [adjustedTickerDetails],
  );

  const {
    isLoading: isLoadingAdjustedETFAggregateDetails,
    multiETFAggregateDetails: adjustedETFAggregateDetails,
    error: adjustedETFAggregateDetailsError,
  } = useMultiETFAggregateDetail(adjustedETFTickerIds);

  const formattedAdjustedSymbolsWithExchange = useMemo(
    () =>
      adjustedTickerDetails?.map((tickerDetail) =>
        formatSymbolWithExchange(tickerDetail),
      ),
    [adjustedTickerDetails],
  );

  const adjustTicker = useCallback((adjustedTicker: TickerBucketTicker) => {
    setAdjustedTickerBucket((prev) => {
      // Find the index of the ticker to adjust
      const tickerIndex = prev.tickers.findIndex(
        (ticker) => ticker.tickerId === adjustedTicker.tickerId,
      );

      if (tickerIndex === -1) {
        // If the ticker is not found, add it to the array
        return {
          ...prev,
          tickers: [...prev.tickers, adjustedTicker],
        };
      }

      // If the ticker exists, update it
      const updatedTickers = [...prev.tickers];
      updatedTickers[tickerIndex] = adjustedTicker;

      return {
        ...prev,
        tickers: updatedTickers,
      };
    });
  }, []);

  const addSearchResultTicker = useCallback(
    (searchResultTicker: RustServiceTickerSearchResult) => {
      setAdjustedTickerBucket((prev) => {
        // Check if the ticker already exists in the adjustedTickerBucket
        const tickerExists = prev.tickers.some(
          (ticker) => ticker.tickerId === searchResultTicker.ticker_id,
        );

        if (tickerExists) {
          // If the ticker already exists, return the previous state without modification
          return prev;
        }

        // If the ticker does not exist, add it
        const newTicker: TickerBucketTicker = {
          tickerId: searchResultTicker.ticker_id,
          symbol: searchResultTicker.symbol,
          exchangeShortName: searchResultTicker.exchange_short_name,
          quantity: 1,
        };

        // Automatically select new ticker id
        setSelectedTickerIds((prev) => [
          ...new Set([...prev, searchResultTicker.ticker_id]),
        ]);

        return {
          ...prev,
          tickers: [...prev.tickers, newTicker],
        };
      });
    },
    [],
  );

  const removeTickerWithId = useCallback(
    (tickerId: number) => {
      const symbol = adjustedTickerBucket.tickers.find(
        (ticker) => ticker.tickerId === tickerId,
      )?.symbol;
      try {
        setAdjustedTickerBucket((prev) => ({
          ...prev,
          tickers: prev.tickers.filter(
            (prevTicker) => prevTicker.tickerId !== tickerId,
          ),
        }));

        if (symbol) {
          showNotification(
            `"${symbol}" removed from "${adjustedTickerBucket.name}"`,
            "warning",
          );
        }
      } catch (err) {
        customLogger.error(err);

        const formattedUIErrorSymbol = symbol ? `"${symbol}"` : "the ticker";
        triggerUIError(
          new Error(
            `An error occurred when trying to remove ${formattedUIErrorSymbol} from "${adjustedTickerBucket.name}"`,
          ),
        );
      }
    },
    [adjustedTickerBucket, showNotification, triggerUIError],
  );

  const filteredTickerBucket = useMemo(() => {
    const filteredTickers = adjustedTickerBucket.tickers.filter((ticker) =>
      selectedTickerIds.includes(ticker.tickerId),
    );

    return {
      ...adjustedTickerBucket,
      tickers: filteredTickers,
    };
  }, [adjustedTickerBucket, selectedTickerIds]);

  const isTickerBucketSaved = useMemo(
    () => deepEqual(tickerBucket, adjustedTickerBucket),
    [tickerBucket, adjustedTickerBucket],
  );

  const saveTickerBucket = useCallback(() => {
    try {
      store.updateTickerBucket(tickerBucket, adjustedTickerBucket);
      showNotification(`"${adjustedTickerBucket.name}" saved`, "success");
    } catch (err) {
      customLogger.error(err);
      triggerUIError(
        new Error(
          `An error occurred when trying to save "${adjustedTickerBucket.name}"`,
        ),
      );
    }
  }, [tickerBucket, adjustedTickerBucket, showNotification, triggerUIError]);

  const cancelTickerAdjustments = useCallback(() => {
    try {
      setAdjustedTickerBucket(tickerBucket);

      // Reset selected ticker IDs
      //
      // Resolves an issue where adding a ticker while all IDs were selected
      // and then canceling would result in an incorrect state for selected IDs.
      setSelectedTickerIds(
        tickerBucket.tickers.map((ticker) => ticker.tickerId),
      );

      // This is needed to reset slider positions since they are not controlled by React
      forceRefresh();

      showNotification("Ticker adjustments canceled", "warning");
    } catch (err) {
      customLogger.error(err);
      triggerUIError(new Error("Could not cancel ticker adjustments"));
    }
  }, [tickerBucket, forceRefresh, showNotification, triggerUIError]);

  const selectTickerId = useCallback((tickerId: number) => {
    setSelectedTickerIds((prevTickerIds) => {
      if (prevTickerIds.includes(tickerId)) {
        return prevTickerIds; // Avoid unnecessary re-renders
      }
      return [...prevTickerIds, tickerId];
    });
  }, []);

  const deselectTickerId = useCallback((tickerId: number) => {
    setSelectedTickerIds((prevTickerIds) =>
      prevTickerIds.filter((prevTickerId) => prevTickerId !== tickerId),
    );
  }, []);

  const selectAllTickerIds = useCallback(() => {
    setSelectedTickerIds(
      adjustedTickerBucket.tickers.map((ticker) => ticker.tickerId),
    );
  }, [adjustedTickerBucket]);

  const clearSelectedTickerIds = useCallback(() => {
    setSelectedTickerIds([]);
  }, []);

  const areAllTickersSelected = useMemo(
    () => selectedTickerIds.length === adjustedTickerBucket.tickers.length,
    [selectedTickerIds, adjustedTickerBucket.tickers.length],
  );

  const areNoTickersSelected = useMemo(
    () => selectedTickerIds.length === 0,
    [selectedTickerIds],
  );

  const {
    missingTickerIds: missingAuditedTickerVectorIds,
    isAuditPending: isTickerVectorAuditPending,
  } = useTickerVectorAudit(preferredTickerVectorConfigKey, selectedTickerIds);

  const contextValue = useMemo(
    () => ({
      selectedTickerIds,
      selectTickerId,
      deselectTickerId,
      selectAllTickerIds,
      clearSelectedTickerIds,
      areAllTickersSelected,
      areNoTickersSelected,
      adjustTicker,
      addSearchResultTicker,
      removeTickerWithId,
      adjustedTickerBucket,
      filteredTickerBucket,
      saveTickerBucket,
      cancelTickerAdjustments,
      isTickerBucketSaved,
      //
      isLoadingAdjustedTickerDetails,
      adjustedTickerDetails,
      adjustedTickerDetailsError,
      isLoadingAdjustedETFAggregateDetails,
      adjustedETFAggregateDetails,
      adjustedETFAggregateDetailsError,
      formattedAdjustedSymbolsWithExchange,
      //
      missingAuditedTickerVectorIds,
      isTickerVectorAuditPending,
      //
      forceRefreshIndex,
    }),
    [
      selectedTickerIds,
      selectTickerId,
      deselectTickerId,
      selectAllTickerIds,
      clearSelectedTickerIds,
      areAllTickersSelected,
      areNoTickersSelected,
      adjustTicker,
      addSearchResultTicker,
      removeTickerWithId,
      adjustedTickerBucket,
      filteredTickerBucket,
      saveTickerBucket,
      cancelTickerAdjustments,
      isTickerBucketSaved,
      //
      isLoadingAdjustedTickerDetails,
      adjustedTickerDetails,
      adjustedTickerDetailsError,
      isLoadingAdjustedETFAggregateDetails,
      adjustedETFAggregateDetails,
      adjustedETFAggregateDetailsError,
      formattedAdjustedSymbolsWithExchange,
      //
      missingAuditedTickerVectorIds,
      isTickerVectorAuditPending,
      //
      forceRefreshIndex,
    ],
  );

  return (
    <TickerSelectionManagerContext.Provider value={contextValue}>
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}
