import React, { ReactNode, createContext, useCallback, useState } from "react";

import { TickerBucket, TickerBucketTicker } from "@src/store";

export type TickerSelectionManagerContextType = {
  selectedTickers: TickerBucketTicker[];
  selectTicker: (ticker: TickerBucketTicker) => void;
  deselectTicker: (tickerId: number) => void;
  clearTickers: () => void;
};

// Set up the default value with empty functions and an empty array for selected tickers
const defaultContextValue: TickerSelectionManagerContextType = {
  selectedTickers: [],
  selectTicker: () => {},
  deselectTicker: () => {},
  clearTickers: () => {},
};

// Create the context with the specified type and default value
export const TickerSelectionManagerContext =
  createContext<TickerSelectionManagerContextType>(defaultContextValue);

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

  const selectTicker = useCallback((newTicker: TickerBucketTicker) => {
    setSelectedTickers((prevTickers) => {
      const existingTicker = prevTickers.find(
        (ticker) => ticker.tickerId === newTicker.tickerId,
      );

      if (existingTicker) {
        // If ticker is already selected, update the quantity
        return prevTickers.map((ticker) =>
          ticker.tickerId === newTicker.tickerId
            ? { ...ticker, quantity: ticker.quantity + newTicker.quantity }
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
      }}
    >
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}
