import React, { useCallback, useContext, useEffect, useRef } from "react";
import { SymbolContainerContext } from "./SymbolContainerProvider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type SymbolContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
  children: React.ReactNode;
};

export default function SymbolContainer({
  tickerSymbol,
  onIntersectionStateChange,
  children,
  ...rest
}: SymbolContainerProps) {
  const { observe, unobserve } = useContext(SymbolContainerContext);

  const elementRef = useRef<HTMLDivElement>(null);

  const onIntersectionStateChangeStableRef = useStableCurrentRef(
    onIntersectionStateChange
  );

  const handleOnIntersectionStateChange = useCallback(
    (isIntersecting: boolean) => {
      // The `stable function reference` is very important here or this will wind
      // up in an infinite loop
      if (onIntersectionStateChangeStableRef.current) {
        onIntersectionStateChangeStableRef.current(isIntersecting);
      }
    },
    [onIntersectionStateChangeStableRef]
  );

  useEffect(() => {
    if (elementRef.current) {
      const el = elementRef.current;
      observe(el, tickerSymbol, handleOnIntersectionStateChange);

      return () => {
        unobserve(el as HTMLElement);
      };
    }
  }, [tickerSymbol, observe, unobserve, handleOnIntersectionStateChange]);

  return (
    <div ref={elementRef} {...rest}>
      {children}
    </div>
  );
}
