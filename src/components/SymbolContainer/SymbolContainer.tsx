import React, { useContext, useEffect, useRef } from "react";
import { SymbolContainerContext } from "./SymbolContainerProvider";

export type SymbolContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  children: React.ReactNode;
};

export default function SymbolContainer({
  tickerSymbol,
  children,
  ...args
}: SymbolContainerProps) {
  const symbolProviderContext = useContext(SymbolContainerContext);

  // TODO: Monitor time and percentage on screen and use to collect metrics
  // about which symbols are looked at the longest. This isn't intended for
  // invasive tracking, but is actually intended to help me personally understand
  // which symbols I may be spending more time looking into without taking action.
  //
  // This state should tie into the store and persist locally to help build a
  // profile.

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const el = elementRef.current;

      symbolProviderContext?.observe(el, tickerSymbol);

      return () => {
        symbolProviderContext?.unobserve(el as HTMLElement);
      };
    }
  }, [symbolProviderContext, tickerSymbol]);

  return (
    <div ref={elementRef} {...args}>
      {children}
    </div>
  );
}
