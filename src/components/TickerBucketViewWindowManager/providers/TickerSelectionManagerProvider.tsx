import React, { ReactNode, createContext, useCallback, useState } from "react";

import { TickerBucket } from "@src/store";

// Define a generic type for the context value
type TickerSelectionManagerContextType = {
  selectedTickerIds: number[];
  selectTickerId: (ticker: number) => void;
  deselectTickerId: (ticker: number) => void;
  clearTickers: () => void;
};

// Set up the default value with empty functions and an empty array for active tickers
const defaultContextValue: TickerSelectionManagerContextType = {
  selectedTickerIds: [],
  selectTickerId: () => {},
  deselectTickerId: () => {},
  clearTickers: () => {},
};

// Create the context with a generic type and default value
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
  const [selectedTickerIds, setSelectedTickerIds] = useState<number[]>(() =>
    // Initially set to all tickers in the bucket
    tickerBucket.tickers.map((ticker) => ticker.tickerId),
  );

  // TODO: Set initial `activeTickers` to be whatever is in the bucket

  // TODO: Consider allowing additional tickers to be added that are not
  // currently in the bucket, to see how they can affect similarity searches,
  // etc., and so that decisions can be made to manually add them.

  const selectTickerId = useCallback((tickerId: number) => {
    setSelectedTickerIds((prevTickerIds) =>
      prevTickerIds.includes(tickerId)
        ? prevTickerIds
        : [...prevTickerIds, tickerId],
    );
  }, []);

  const deselectTickerId = useCallback((tickerId: number) => {
    setSelectedTickerIds((prevTickerIds) =>
      prevTickerIds.filter((t) => t !== tickerId),
    );
  }, []);

  const clearTickers = useCallback(() => {
    setSelectedTickerIds([]);
  }, []);

  return (
    <TickerSelectionManagerContext.Provider
      value={{
        selectedTickerIds,
        selectTickerId,
        deselectTickerId,
        clearTickers,
      }}
    >
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}
