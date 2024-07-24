import React, { createContext, useCallback, useRef } from "react";
import { store } from "@hooks/useStoreStateReader";
import useIntersectionObserver from "@hooks/useIntersectionObserver";

export type TickerContainerContextType = {
  observe: (
    el: HTMLElement,
    tickerSymbol: string, // TODO: Replace with `tickerId`?
    onIntersectionStateChange?: (isIntersecting: boolean) => void
  ) => void;
  unobserve: (el?: HTMLElement) => void;
};

export const TickerContainerContext = createContext<TickerContainerContextType>(
  {} as TickerContainerContextType
);

export type TickerContainerContextProps = {
  children: React.ReactNode;
  perSymbolThreshold?: number;
};

export default function TickerContainerProvider({
  children,
  perSymbolThreshold = 0.5,
}: TickerContainerContextProps) {
  const metadataMapRef = useRef(
    new Map<
      Element,
      {
        symbol: string;
        intersectionCallback?: (isIntersecting: boolean) => void;
      }
    >()
  );
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
        const metadata = metadataMapRef.current.get(entry.target);
        if (metadata) {
          const { symbol, intersectionCallback } = metadata;
          if (entry.isIntersecting) {
            visibleSymbolMapRef.current.set(entry.target, symbol);
          } else {
            visibleSymbolMapRef.current.delete(entry.target);
          }
          if (intersectionCallback && entry.target === entry.target) {
            intersectionCallback(entry.isIntersecting);
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
    (
      el: HTMLElement,
      tickerSymbol: string,
      onIntersectionStateChange?: (isIntersecting: boolean) => void
    ) => {
      observe(el);
      metadataMapRef.current.set(el, {
        symbol: tickerSymbol,
        intersectionCallback: onIntersectionStateChange,
      });
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
    <TickerContainerContext.Provider
      value={{
        observe: handleObserve,
        unobserve: handleUnobserve,
      }}
    >
      {children}
    </TickerContainerContext.Provider>
  );
}
