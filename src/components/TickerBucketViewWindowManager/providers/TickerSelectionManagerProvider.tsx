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
  selectedTickerSymbols: string[];
  selectTickerSymbol: (tickerSymbol: string) => void;
  deselectTickerSymbol: (tickerSymbol: string) => void;
  selectAllTickerSymbols: () => void;
  clearSelectedTickerSymbols: () => void;
  areAllTickersSelected: boolean;
  areNoTickersSelected: boolean;
  adjustTicker: (adjustedTicker: TickerBucketTicker) => void;
  addSearchResultTickers: (
    searchResultTickers: RustServiceTickerSearchResult[],
  ) => void;
  removeTickerWithSymbol: (tickerSymbol: string) => void;
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
  missingAuditedTickerSymbols?: string[] | null;
  isTickerVectorAuditPending: boolean;
  //
  forceRefreshIndex: number;
};

// Set up the default value with empty functions and an empty array for selected tickers
const DEFAULT_CONTEXT_VALUE: TickerSelectionManagerContextType = {
  selectedTickerSymbols: [],
  selectTickerSymbol: () => {},
  deselectTickerSymbol: () => {},
  selectAllTickerSymbols: () => {},
  clearSelectedTickerSymbols: () => {},
  areAllTickersSelected: true,
  areNoTickersSelected: false,
  adjustTicker: () => {},
  addSearchResultTickers: () => {},
  removeTickerWithSymbol: () => {},
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
  missingAuditedTickerSymbols: null,
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

  const [selectedTickerSymbols, setSelectedTickerSymbols] = useState<string[]>(
    () => tickerBucket.tickers.map((ticker) => ticker.symbol),
  );

  const [adjustedTickerBucket, setAdjustedTickerBucket] =
    useState<TickerBucket>(tickerBucket);

  const adjustedTickerSymbols = useMemo(
    () => adjustedTickerBucket.tickers.map((ticker) => ticker.symbol),
    [adjustedTickerBucket],
  );
  const {
    isLoading: isLoadingAdjustedTickerDetails,
    multiTickerDetails: adjustedTickerDetails,
    error: adjustedTickerDetailsError,
  } = useMultiTickerDetail(adjustedTickerSymbols);

  const adjustedETFTickerSymbols = useMemo(
    () =>
      adjustedTickerDetails
        ?.filter((ticker) => ticker.is_etf)
        .map((ticker) => ticker.ticker_symbol) || [],
    [adjustedTickerDetails],
  );

  const {
    isLoading: isLoadingAdjustedETFAggregateDetails,
    multiETFAggregateDetails: adjustedETFAggregateDetails,
    error: adjustedETFAggregateDetailsError,
  } = useMultiETFAggregateDetail(adjustedETFTickerSymbols);

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
        (ticker) => ticker.symbol === adjustedTicker.symbol,
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

  const addSearchResultTickers = useCallback(
    (searchResultTickers: RustServiceTickerSearchResult[]) => {
      setAdjustedTickerBucket((prev) => {
        // Create a new array for updated tickers
        const updatedTickers = [...prev.tickers];

        for (const searchResultTicker of searchResultTickers) {
          // Check if the ticker already exists in the adjustedTickerBucket
          const tickerExists = prev.tickers.some(
            (ticker) => ticker.symbol === searchResultTicker.ticker_symbol,
          );

          if (!tickerExists) {
            // If the ticker does not exist, add it
            const newTicker: TickerBucketTicker = {
              symbol: searchResultTicker.ticker_symbol,
              exchangeShortName: searchResultTicker.exchange_short_name,
              quantity: 1,
            };
            updatedTickers.push(newTicker);
          }
        }

        // Automatically select new ticker ids
        setSelectedTickerSymbols((prevSelected) => [
          ...new Set([
            ...prevSelected,
            ...searchResultTickers.map(
              (searchResultTicker) => searchResultTicker.ticker_symbol,
            ),
          ]),
        ]);

        return {
          ...prev,
          tickers: updatedTickers,
        };
      });
    },
    [],
  );

  const removeTickerWithId = useCallback(
    (tickerSymbol: string) => {
      try {
        setAdjustedTickerBucket((prev) => ({
          ...prev,
          tickers: prev.tickers.filter(
            (prevTicker) => prevTicker.symbol !== tickerSymbol,
          ),
        }));

        if (tickerSymbol) {
          showNotification(
            `"${tickerSymbol}" removed from "${adjustedTickerBucket.name}"`,
            "warning",
          );
        }
      } catch (err) {
        customLogger.error(err);

        const formattedUIErrorSymbol = tickerSymbol
          ? `"${tickerSymbol}"`
          : "the ticker";
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
      selectedTickerSymbols.includes(ticker.symbol),
    );

    return {
      ...adjustedTickerBucket,
      tickers: filteredTickers,
    };
  }, [adjustedTickerBucket, selectedTickerSymbols]);

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

      // Reset selected ticker symbols
      //
      // Resolves an issue where adding a ticker while all symbols were selected
      // and then canceling would result in an incorrect state for the selected symbol.
      setSelectedTickerSymbols(
        tickerBucket.tickers.map((ticker) => ticker.symbol),
      );

      // This is needed to reset slider positions since they are not controlled by React
      forceRefresh();

      showNotification("Ticker adjustments canceled", "warning");
    } catch (err) {
      customLogger.error(err);
      triggerUIError(new Error("Could not cancel ticker adjustments"));
    }
  }, [tickerBucket, forceRefresh, showNotification, triggerUIError]);

  const selectTickerSymbol = useCallback((tickerSymbol: string) => {
    setSelectedTickerSymbols((prevTickerSymbols) => {
      if (prevTickerSymbols.includes(tickerSymbol)) {
        return prevTickerSymbols; // Avoid unnecessary re-renders
      }
      return [...prevTickerSymbols, tickerSymbol];
    });
  }, []);

  const deselectTickerSymbol = useCallback((tickerSymbol: string) => {
    setSelectedTickerSymbols((prevTickerSymbols) =>
      prevTickerSymbols.filter(
        (prevTickerSymbol) => prevTickerSymbol !== tickerSymbol,
      ),
    );
  }, []);

  const selectAllTickerSymbols = useCallback(() => {
    setSelectedTickerSymbols(
      adjustedTickerBucket.tickers.map((ticker) => ticker.symbol),
    );
  }, [adjustedTickerBucket]);

  const clearSelectedTickerSymbols = useCallback(() => {
    setSelectedTickerSymbols([]);
  }, []);

  const areAllTickersSelected = useMemo(
    () => selectedTickerSymbols.length === adjustedTickerBucket.tickers.length,
    [selectedTickerSymbols, adjustedTickerBucket.tickers.length],
  );

  const areNoTickersSelected = useMemo(
    () => selectedTickerSymbols.length === 0,
    [selectedTickerSymbols],
  );

  const {
    missingTickerSymbols: missingAuditedTickerSymbols,
    isAuditPending: isTickerVectorAuditPending,
  } = useTickerVectorAudit(
    preferredTickerVectorConfigKey,
    selectedTickerSymbols,
  );

  const contextValue = useMemo(
    () => ({
      selectedTickerSymbols,
      selectTickerSymbol,
      deselectTickerSymbol,
      selectAllTickerSymbols,
      clearSelectedTickerSymbols,
      areAllTickersSelected,
      areNoTickersSelected,
      adjustTicker,
      addSearchResultTickers,
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
      missingAuditedTickerSymbols,
      isTickerVectorAuditPending,
      //
      forceRefreshIndex,
    }),
    [
      selectedTickerSymbols,
      selectTickerSymbol,
      deselectTickerSymbol,
      selectAllTickerSymbols,
      clearSelectedTickerSymbols,
      areAllTickersSelected,
      areNoTickersSelected,
      adjustTicker,
      addSearchResultTickers,
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
      missingAuditedTickerSymbols,
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
