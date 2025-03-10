import React, { createContext, useCallback, useRef } from "react";

import type { RustServiceTickerSymbol } from "@services/RustService";

import useIntersectionObserver from "@hooks/useIntersectionObserver";
import { store } from "@hooks/useStoreStateReader";

import arraysEqual from "@utils/arraysEqual";

export type TickerContainerContextType = {
  observe: (
    el: HTMLElement,
    tickerSymbol: RustServiceTickerSymbol,
    onIntersectionStateChange?: (isIntersecting: boolean) => void,
  ) => void;
  unobserve: (el?: HTMLElement) => void;
};

export const TickerContainerContext = createContext<TickerContainerContextType>(
  {} as TickerContainerContextType,
);

export type TickerContainerContextProps = {
  children: React.ReactNode;
  perSymbolThreshold?: number;
};

export default function TickerContainerProvider({
  children,
  perSymbolThreshold = 0,
}: TickerContainerContextProps) {
  const metadataMapRef = useRef(
    new Map<
      Element,
      {
        tickerSymbol: RustServiceTickerSymbol;
        intersectionCallback?: (isIntersecting: boolean) => void;
      }
    >(),
  );
  const visibleSymbolMapRef = useRef(
    new Map<Element, RustServiceTickerSymbol>(),
  );

  const syncVisibleTickers = useCallback(() => {
    const prev = store.state.visibleTickerSymbols;

    const next = [...new Set(visibleSymbolMapRef.current.values())];

    if (!arraysEqual(prev, next)) {
      store.setVisibleTickers(next);
    }
  }, []);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const metadata = metadataMapRef.current.get(entry.target);
        if (metadata) {
          const { tickerSymbol, intersectionCallback } = metadata;
          if (entry.isIntersecting) {
            visibleSymbolMapRef.current.set(entry.target, tickerSymbol);
          } else {
            visibleSymbolMapRef.current.delete(entry.target);
          }
          if (intersectionCallback && entry.target === entry.target) {
            intersectionCallback(entry.isIntersecting);
          }
        }
      });

      syncVisibleTickers();
    },
    [syncVisibleTickers],
  );

  const { observe, unobserve } = useIntersectionObserver(
    observerCallback,
    perSymbolThreshold,
  );

  const handleObserve = useCallback(
    (
      el: HTMLElement,
      tickerSymbol: RustServiceTickerSymbol,
      onIntersectionStateChange?: (isIntersecting: boolean) => void,
    ) => {
      observe(el);
      metadataMapRef.current.set(el, {
        tickerSymbol,
        intersectionCallback: onIntersectionStateChange,
      });
    },
    [observe],
  );

  const handleUnobserve = useCallback(
    (el?: HTMLElement) => {
      if (el) {
        unobserve(el);
        metadataMapRef.current.delete(el);
        visibleSymbolMapRef.current.delete(el);
        syncVisibleTickers();
      }
    },
    [unobserve, syncVisibleTickers],
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
