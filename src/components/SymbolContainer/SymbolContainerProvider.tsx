import React, { createContext, useCallback, useEffect, useRef } from "react";
import { store } from "@hooks/useStoreStateReader";

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

// Patch for ESLint not seeing browser's IntersectionObserverCallback
type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void;

export default function SymbolContainerProvider({
  children,
  perSymbolThreshold = 0.5,
}: SymbolContainerContextProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Contains mapping for registered observers
  const metadataMapRef = useRef(new Map<Element, string>());

  // Contains mapping for currently visible observers
  const visibleSymbolMapRef = useRef(new Map<Element, string>());

  /**
   * Syncs the unique visible symbols with the store.
   */
  const syncVisibleSymbols = useCallback(() => {
    const uniqueVisibleSymbols = [
      ...new Set(visibleSymbolMapRef.current.values()),
    ];

    store.setVisibleSymbols(uniqueVisibleSymbols);
  }, []);

  const handleObserve = useCallback((el: HTMLElement, tickerSymbol: string) => {
    if (observerRef.current) {
      observerRef.current.observe(el);
      metadataMapRef.current.set(el, tickerSymbol);
    }
  }, []);

  const handleUnobserve = useCallback(
    (el?: HTMLElement) => {
      if (el && observerRef.current) {
        observerRef.current.unobserve(el);
        metadataMapRef.current.delete(el);
        visibleSymbolMapRef.current.delete(el);

        syncVisibleSymbols();
      }
    },
    [syncVisibleSymbols]
  );

  useEffect(() => {
    /**
     * Note: This callback is used in conjunction with the `handleUnobserve` callback.`IntersectionObserverCallback`
     * is invoked when there is an intersection difference on the page, but is not emit when the elements are removed
     * from the DOM, which is where `handleUnobserve` steps in.
     */
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const symbol = metadataMapRef.current.get(entry.target);
        if (symbol) {
          if (entry.isIntersecting) {
            // console.debug(`Element with ticker symbol ${symbol} is visible.`);
            visibleSymbolMapRef.current.set(entry.target, symbol);
          } else {
            // console.debug(`Element with ticker symbol ${symbol} is not visible.`);
            visibleSymbolMapRef.current.delete(entry.target);
          }
        } else {
          console.debug("No symbol associated with the element.");
        }
      });

      syncVisibleSymbols();
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: perSymbolThreshold,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [perSymbolThreshold, syncVisibleSymbols]);

  return (
    <SymbolContainerContext.Provider
      value={{
        observe: handleObserve,
        unobserve: handleUnobserve,
      }}
    >
      {children}
    </SymbolContainerContext.Provider>
  );
}
