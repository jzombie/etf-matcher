import React, { useCallback, useContext, useEffect, useRef } from "react";
import { TickerContainerContext } from "./TickerContainerProvider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type TickerContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
  children: React.ReactNode;
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
      observe(el, tickerId, handleOnIntersectionStateChange);

      return () => {
        unobserve(el as HTMLElement);
      };
    }
  }, [tickerId, observe, unobserve, handleOnIntersectionStateChange]);

  return (
    <div ref={elementRef} {...rest}>
      {children}
    </div>
  );
}
