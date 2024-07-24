import React, { createContext, useCallback, useRef } from "react";
import { store } from "@hooks/useStoreStateReader";
import useIntersectionObserver from "@hooks/useIntersectionObserver";

export type TickerContainerContextType = {
  observe: (
    el: HTMLElement,
    tickerId: number,
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
        tickerId: number;
        intersectionCallback?: (isIntersecting: boolean) => void;
      }
    >()
  );
  const visibleSymbolMapRef = useRef(new Map<Element, number>());

  const syncVisibleSymbols = useCallback(() => {
    const uniqueVisibleTickerIds = [
      ...new Set(visibleSymbolMapRef.current.values()),
    ];
    store.setVisibleTickers(uniqueVisibleTickerIds);
  }, []);

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const metadata = metadataMapRef.current.get(entry.target);
        if (metadata) {
          const { tickerId, intersectionCallback } = metadata;
          if (entry.isIntersecting) {
            visibleSymbolMapRef.current.set(entry.target, tickerId);
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
      tickerId: number,
      onIntersectionStateChange?: (isIntersecting: boolean) => void
    ) => {
      observe(el);
      metadataMapRef.current.set(el, {
        tickerId,
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
