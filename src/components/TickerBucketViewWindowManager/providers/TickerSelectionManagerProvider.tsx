import React, {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import store, { TickerBucket, TickerBucketTicker } from "@src/store";

import deepEqual from "@utils/deepEqual";

export type TickerSelectionManagerContextType = {
  selectedTickerIds: number[];
  selectTickerId: (tickerId: number) => void;
  deselectTickerId: (tickerId: number) => void;
  clearSelectedTickerIds: () => void;
  adjustTicker: (adjustedTicker: TickerBucketTicker) => void;
  adjustedTickerBucket: TickerBucket;
  filteredTickerBucket: TickerBucket;
  saveTickerBucket: () => void;
  isTickerBucketSaved: boolean;
};

// Set up the default value with empty functions and an empty array for selected tickers
const DEFAULT_CONTEXT_VALUE: TickerSelectionManagerContextType = {
  selectedTickerIds: [],
  selectTickerId: () => {},
  deselectTickerId: () => {},
  clearSelectedTickerIds: () => {},
  adjustTicker: () => {},
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

  const clearSelectedTickerIds = useCallback(() => {
    setSelectedTickerIds([]);
  }, []);

  return (
    <TickerSelectionManagerContext.Provider
      value={{
        selectedTickerIds,
        selectTickerId,
        deselectTickerId,
        clearSelectedTickerIds,
        adjustTicker,
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
