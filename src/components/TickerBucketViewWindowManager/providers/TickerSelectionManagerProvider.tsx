import React, { ReactNode, createContext, useCallback, useState } from "react";

import { TickerBucket } from "@src/store";

// Define a generic type for the context value
type TickerSelectionManagerContextType = {
  activeTickers: string[];
  selectTicker: (ticker: string) => void;
  deselectTicker: (ticker: string) => void;
  clearTickers: () => void;
};

// Set up the default value with empty functions and an empty array for active tickers
const defaultContextValue: TickerSelectionManagerContextType = {
  activeTickers: [],
  selectTicker: () => {},
  deselectTicker: () => {},
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
  const [activeTickers, setActiveTickers] = useState<string[]>([]);

  // TODO: Set initial `activeTickers` to be whatever is in the bucket

  // TODO: Consider allowing additional tickers to be added that are not
  // currently in the bucket, to see how they can affect similarity searches,
  // etc., and so that decisions can be made to manually add them.

  const selectTicker = useCallback((ticker: string) => {
    setActiveTickers((prevTickers) =>
      prevTickers.includes(ticker) ? prevTickers : [...prevTickers, ticker],
    );
  }, []);

  const deselectTicker = useCallback((ticker: string) => {
    setActiveTickers((prevTickers) => prevTickers.filter((t) => t !== ticker));
  }, []);

  const clearTickers = useCallback(() => {
    setActiveTickers([]);
  }, []);

  return (
    <TickerSelectionManagerContext.Provider
      value={{
        activeTickers,
        selectTicker,
        deselectTicker,
        clearTickers,
      }}
    >
      {children}
    </TickerSelectionManagerContext.Provider>
  );
}

// Custom hook to access the context easily
// export const useTickerBucketViewWindowManagerContent = () => {
//   const context = useContext(TickerBucketViewWindowManagerContentContext);
//   if (!context) {
//     throw new Error(
//       "useTickerBucketViewWindowManagerContent must be used within a TickerBucketViewWindowManagerContentProvider",
//     );
//   }
//   return context;
// };
