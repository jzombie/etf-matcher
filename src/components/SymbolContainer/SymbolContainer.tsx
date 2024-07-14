import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { SymbolContainerContext } from "./SymbolContainerProvider";

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

  useEffect(() => {
    if (elementRef.current) {
      const el = elementRef.current;
      observe(el, tickerSymbol, onIntersectionStateChange);

      return () => {
        unobserve(el as HTMLElement);
      };
    }
  }, [tickerSymbol, observe, unobserve, onIntersectionStateChange]);

  return (
    <div ref={elementRef} {...rest}>
      {children}
    </div>
  );
}
