import React, { useEffect, useRef } from "react";

export type SymbolContainerProps = {
  tickerSymbol: string;
  children: React.ReactNode;
};

export default function SymbolContainer({
  tickerSymbol,
  children,
  ...args
}: SymbolContainerProps) {
  // TODO: Monitor time and percentage on screen and use to collect metrics
  // about which symbols are looked at the longest. This isn't intended for
  // invasive tracking, but is actually intended to help me personally understand
  // which symbols I may be spending more time looking into without taking action.
  //
  // This state should tie into the store and persist locally to help build a
  // profile.

  const elementRef = useRef<HTMLDivElement>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    console.warn(`TODO: Handle SymbolContainer for ${tickerSymbol}`);

    const callback = (isIntersecting: boolean) => {
      console.log(tickerSymbol, { isIntersecting });
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    };

    // TODO: Use React.Context for this instead of creating a new observer per element
    observerRef.current = new IntersectionObserver(observerCallback, {
      // `threshold` determines how much of the element should be in view before triggering the callback
      threshold: 0.5, // Adjust the threshold as needed
    });

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    };
  }, [tickerSymbol]);

  return (
    <div ref={elementRef} {...args}>
      {children}
    </div>
  );
}
