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
  groupTickerSymbols: string[];
  children: React.ReactNode;
};

export default function SymbolContainer({
  tickerSymbol,
  groupTickerSymbols,
  children,
  ...rest
}: SymbolContainerProps) {
  const { observe, unobserve } = useContext(SymbolContainerContext);

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const el = elementRef.current;
      observe(el, tickerSymbol, (isIntersecting) => {
        // TODO: Handle accordingly
        console.log({
          el,
          isIntersecting,
        });
      });

      return () => {
        unobserve(el as HTMLElement);
      };
    }
  }, [tickerSymbol, observe, unobserve]);

  return (
    <div ref={elementRef} {...rest}>
      {children}
    </div>
  );
}
