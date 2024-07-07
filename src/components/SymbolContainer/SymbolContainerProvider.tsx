import React, { createContext, useCallback, useEffect, useRef } from "react";

export type SymbolContainerContextType = {
  // TODO: Refine types
  observe: (el: HTMLElement, tickerSymbol: string) => void;
  unobserve: (el?: HTMLElement) => void;
  // tickerSymbol: string;
  // visibilityRatio: number;
  // timeInView: number;
  // setTickerSymbol: (tickerSymbol: string) => void;
  // setVisibilityRatio: (ratio: number) => void;
  // setTimeInView: (time: number) => void;
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
  const metadataMap = useRef(new Map<Element, string>());

  // Contains mapping for currently visible observers
  const visibleSymbolMap = useRef(new Map<Element, string>());

  // const getVisibleSymbols = useCallback((): string[] => {
  //   return [...new Set([...metadataMap.current.values()])];
  // }, []);

  const handleObserve = useCallback((el: HTMLElement, tickerSymbol: string) => {
    if (observerRef.current) {
      observerRef.current.observe(el);
      metadataMap.current.set(el, tickerSymbol);
    }
  }, []);

  const handleUnobserve = useCallback((el?: HTMLElement) => {
    if (el && observerRef.current) {
      observerRef.current.unobserve(el);
      metadataMap.current.delete(el);
      visibleSymbolMap.current.delete(el);
    }

    console.log("visible symbols", [...visibleSymbolMap.current.values()]);
  }, []);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const symbol = metadataMap.current.get(entry.target);
        if (symbol) {
          if (entry.isIntersecting) {
            console.log(`Element with ticker symbol ${symbol} is visible.`);
            visibleSymbolMap.current.set(entry.target, symbol);
          } else {
            console.log(`Element with ticker symbol ${symbol} is not visible.`);
            visibleSymbolMap.current.delete(entry.target);
          }
        } else {
          console.log("No symbol associated with the element.");
        }
      });

      console.log("visible symbols", [...visibleSymbolMap.current.values()]);
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: perSymbolThreshold,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [perSymbolThreshold]);

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
