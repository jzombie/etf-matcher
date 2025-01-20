import React, { useCallback, useContext, useEffect, useRef } from "react";

import Full, { FullProps } from "@layoutKit/Full";
import type { RustServiceTickerSymbol } from "@services/RustService";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import { TickerContainerContext } from "./TickerContainerProvider";

export type TickerContainerProps = FullProps & {
  tickerSymbol: RustServiceTickerSymbol;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
};

export default function TickerContainer({
  tickerSymbol,
  onIntersectionStateChange,
  children,
  ...rest
}: TickerContainerProps) {
  const { observe, unobserve } = useContext(TickerContainerContext);

  const elementRef = useRef<HTMLDivElement>(null);

  const onIntersectionStateChangeStableRef = useStableCurrentRef(
    onIntersectionStateChange,
  );

  const handleOnIntersectionStateChange = useCallback(
    (isIntersecting: boolean) => {
      // The `stable function reference` is very important here or this will wind
      // up in an infinite loop
      if (onIntersectionStateChangeStableRef.current) {
        onIntersectionStateChangeStableRef.current(isIntersecting);
      }
    },
    [onIntersectionStateChangeStableRef],
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
    <Full ref={elementRef} {...rest}>
      {children}
    </Full>
  );
}
