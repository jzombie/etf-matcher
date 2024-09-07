import React, { useCallback, useContext, useEffect, useRef } from "react";

import Full, { FullProps } from "@layoutKit/Full";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import { TickerContainerContext } from "./TickerContainerProvider";

export type TickerContainerProps = FullProps & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
};

export default function TickerContainer({
  tickerId,
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
      observe(el, tickerId, handleOnIntersectionStateChange);

      return () => {
        unobserve(el as HTMLElement);
      };
    }
  }, [tickerId, observe, unobserve, handleOnIntersectionStateChange]);

  return (
    <Full ref={elementRef} {...rest}>
      {children}
    </Full>
  );
}
