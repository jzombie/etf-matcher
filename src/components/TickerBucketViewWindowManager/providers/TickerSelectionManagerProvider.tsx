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
  selectedTickers: TickerBucketTicker[];
  selectTicker: (ticker: TickerBucketTicker) => void;
  deselectTicker: (tickerId: number) => void;
  clearTickers: () => void;
  adjustedTickerBucket: TickerBucket;
  save: () => void;
  isSaved: boolean;
};

// Set up the default value with empty functions and an empty array for selected tickers
const DEFAULT_CONTEXT_VALUE: TickerSelectionManagerContextType = {
  selectedTickers: [],
  selectTicker: () => {},
  deselectTicker: () => {},
  clearTickers: () => {},
  adjustedTickerBucket: {
    uuid: "N/A",
    name: "N/A",
    tickers: [],
    type: "watchlist",
    description: "N/A",
    isUserConfigurable: true,
  },
  save: () => {},
  isSaved: true,
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
  const [selectedTickers, setSelectedTickers] = useState<TickerBucketTicker[]>(
    () => tickerBucket.tickers,
  );

  const adjustedTickerBucket = useMemo(
    () => ({
      ...tickerBucket,
      tickers: selectedTickers,
    }),
    [tickerBucket, selectedTickers],
  );

  const isSaved = useMemo(
    () => deepEqual(tickerBucket, adjustedTickerBucket),
    [tickerBucket, adjustedTickerBucket],
  );

  const handleSave = useCallback(
    () => store.updateTickerBucket(tickerBucket, adjustedTickerBucket),
    [tickerBucket, adjustedTickerBucket],
  );

  // TODO: Rename so this conveys the weight can be updated as well
  const selectTicker = useCallback((newTicker: TickerBucketTicker) => {
    setSelectedTickers((prevTickers) => {
      const existingTicker = prevTickers.find(
        (ticker) => ticker.tickerId === newTicker.tickerId,
      );

      if (existingTicker) {
        // If ticker is already selected, update the quantity
        return prevTickers.map((ticker) =>
          ticker.tickerId === newTicker.tickerId
            ? { ...ticker, quantity: newTicker.quantity }
            : ticker,
        );
      } else {
        // If ticker is not selected, add it to the list
        return [...prevTickers, newTicker];
      }
    });
  }, []);

  const deselectTicker = useCallback((tickerId: number) => {
    setSelectedTickers((prevTickers) =>
      prevTickers.filter((ticker) => ticker.tickerId !== tickerId),
    );
  }, []);

  const clearTickers = useCallback(() => {
    setSelectedTickers([]);
  }, []);

  return (
    <TickerSelectionManagerContext.Provider
      value={{
        selectedTickers,
        selectTicker,
        deselectTicker,
        clearTickers,
        adjustedTickerBucket,
        save: handleSave,
        isSaved,
      }}
    >
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}
