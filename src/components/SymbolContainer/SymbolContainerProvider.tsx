import React, { createContext, useCallback, useRef } from "react";
import { store } from "@hooks/useStoreStateReader";
import useIntersectionObserver from "@hooks/useIntersectionObserver";

// Modified version of `useIntersectionObserver` return
export type SymbolContainerContextType = {
  observe: (el: HTMLElement, tickerSymbol: string) => void;
  unobserve: (el?: HTMLElement) => void;
};

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
  const metadataMapRef = useRef(new Map<Element, string>());
  const visibleSymbolMapRef = useRef(new Map<Element, string>());

  const syncVisibleSymbols = useCallback(() => {
    const uniqueVisibleSymbols = [
      ...new Set(visibleSymbolMapRef.current.values()),
    ];
    store.setVisibleSymbols(uniqueVisibleSymbols);
  }, []);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const symbol = metadataMapRef.current.get(entry.target);
        if (symbol) {
          if (entry.isIntersecting) {
            visibleSymbolMapRef.current.set(entry.target, symbol);
          } else {
            visibleSymbolMapRef.current.delete(entry.target);
          }
        }
      });

      syncVisibleSymbols();
    },
    [syncVisibleSymbols]
  );

  const { observe, unobserve } = useIntersectionObserver(
    observerCallback,
    perSymbolThreshold
  );

  const handleObserve = useCallback(
    (el: HTMLElement, tickerSymbol: string) => {
      observe(el);
      metadataMapRef.current.set(el, tickerSymbol);
    },
    [observe]
  );

  const handleUnobserve = useCallback(
    (el?: HTMLElement) => {
      if (el) {
        unobserve(el);
        metadataMapRef.current.delete(el);
        visibleSymbolMapRef.current.delete(el);
        syncVisibleSymbols();
      }
    },
    [unobserve, syncVisibleSymbols]
  );

  return (
    <SymbolContainerContext.Provider
      value={{ observe: handleObserve, unobserve: handleUnobserve }}
    >
      {children}
    </SymbolContainerContext.Provider>
  );
}
