import React, {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import type { RustServiceTickerSearchResult } from "@services/RustService";
import store, { TickerBucket, TickerBucketTicker } from "@src/store";

import deepEqual from "@utils/deepEqual";

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
  isTickerBucketSaved: boolean;
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
  isTickerBucketSaved: true,
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
  const [selectedTickerIds, setSelectedTickerIds] = useState<number[]>(() =>
    tickerBucket.tickers.map((ticker) => ticker.tickerId),
  );

  const [adjustedTickerBucket, setAdjustedTickerBucket] =
    useState<TickerBucket>(tickerBucket);

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

  // TODO: Build out
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

        return {
          ...prev,
          tickers: [...prev.tickers, newTicker],
        };
      });
    },
    [],
  );

  const removeTickerWithId = useCallback((tickerId: number) => {
    setAdjustedTickerBucket((prev) => ({
      ...prev,
      tickers: prev.tickers.filter(
        (prevTicker) => prevTicker.tickerId != tickerId,
      ),
    }));
  }, []);

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

  const saveTickerBucket = useCallback(
    () => store.updateTickerBucket(tickerBucket, adjustedTickerBucket),
    [tickerBucket, adjustedTickerBucket],
  );

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
    setSelectedTickerIds(tickerBucket.tickers.map((ticker) => ticker.tickerId));
  }, [tickerBucket]);

  const clearSelectedTickerIds = useCallback(() => {
    setSelectedTickerIds([]);
  }, []);

  const areAllTickersSelected = useMemo(
    () => selectedTickerIds.length === tickerBucket.tickers.length,
    [selectedTickerIds, tickerBucket.tickers.length],
  );

  const areNoTickersSelected = useMemo(
    () => selectedTickerIds.length === 0,
    [selectedTickerIds],
  );

  return (
    <TickerSelectionManagerContext.Provider
      value={{
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
        isTickerBucketSaved,
      }}
    >
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}
