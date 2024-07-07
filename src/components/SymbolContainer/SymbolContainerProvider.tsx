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
};

export default function SymbolContainerProvider({
  children,
}: SymbolContainerContextProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const metadataMap = useRef(new Map<Element, string>());
  const visibleSymbolsRef = useRef(new Set<string>());

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
    }
  }, []);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const symbol = metadataMap.current.get(entry.target);
        if (symbol) {
          if (entry.isIntersecting) {
            console.log(`Element with ticker symbol ${symbol} is visible.`);
            visibleSymbolsRef.current.add(symbol);
          } else {
            console.log(`Element with ticker symbol ${symbol} is not visible.`);
            visibleSymbolsRef.current.delete(symbol);
          }
        } else {
          console.log("No symbol associated with the element.");
        }
      });

      console.log("visible symbols", [...visibleSymbolsRef.current.values()]);
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.5, // Adjust the threshold as needed
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

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
