import React, { createContext } from "react";
import { store } from "@hooks/useStoreStateReader";
import useIntersectionObserver from "@hooks/useIntersectionObserver";

// Define the context type
export type SymbolContainerContextType = {
  observe: (el: HTMLElement, tickerSymbol: string) => void;
  unobserve: (el?: HTMLElement) => void;
};

// Create the context
export const SymbolContainerContext = createContext<
  SymbolContainerContextType | undefined
>(undefined);

export type SymbolContainerContextProps = {
  children: React.ReactNode;
  perSymbolThreshold?: number;
};

export default function SymbolContainerProvider({
  children,
  perSymbolThreshold = 0.5,
}: SymbolContainerContextProps) {
  const setVisibleSymbols = (symbols: string[]) => {
    store.setVisibleSymbols(symbols);
  };

  const { observe, unobserve } = useIntersectionObserver(
    setVisibleSymbols,
    perSymbolThreshold
  );

  return (
    <SymbolContainerContext.Provider value={{ observe, unobserve }}>
      {children}
    </SymbolContainerContext.Provider>
  );
}
