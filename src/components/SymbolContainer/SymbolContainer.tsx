import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { SymbolContainerContext } from "./SymbolContainerProvider";

import useStoreStateReader from "@hooks/useStoreStateReader";

export type SymbolContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerSymbol: string;
  groupTickerSymbols: string[];
  children: React.ReactNode;
  onFullRenderSymbolStateChange?: (isFullRenderSymbol: boolean) => void;
};

export default function SymbolContainer({
  tickerSymbol,
  groupTickerSymbols,
  children,
  onFullRenderSymbolStateChange,
  ...rest
}: SymbolContainerProps) {
  // Add prop validation
  useEffect(() => {
    // Validate groupTickerSymbols is unique
    if (groupTickerSymbols.length !== [...new Set(groupTickerSymbols)].length) {
      console.warn(
        "`groupTickerSymbols` is not unique! Unpredictable results may occur."
      );
    }

    // Validate ticker symbol is in groupTickerSymbols
    if (!groupTickerSymbols.includes(tickerSymbol)) {
      console.warn(
        "`groupTickerSymbols` does not include `tickerSymbol`. Unpredictable results may occur."
      );
    }
  }, [tickerSymbol, groupTickerSymbols]);

  const symbolProviderContext = useContext(SymbolContainerContext);

  const { visibleSymbols } = useStoreStateReader(["visibleSymbols"]);

  const maxIdxPrevVisibleSymbolRef = useRef<number>(-1);

  // TODO: Rename
  const isFullRenderSymbol = useMemo(() => {
    if (visibleSymbols.includes(tickerSymbol)) {
      return true;
    }

    const lastVisibleSymbol = visibleSymbols.at(-1);

    if (lastVisibleSymbol === undefined) {
      return false;
    }

    // Where the last visible symbol lies in the group
    const idxGroupLastVisible = groupTickerSymbols.indexOf(lastVisibleSymbol);

    if (idxGroupLastVisible > maxIdxPrevVisibleSymbolRef.current) {
      maxIdxPrevVisibleSymbolRef.current = idxGroupLastVisible;
    }

    // TODO: Keep track of max visible symbol idx as a ref, regardless if
    // the page has been scrolled, to avoid re-querying on subsequent scrolling
    //
    // TODO: Handle `maxIdxPrevVisibleSymbolRef`

    // Where the symbol lies in the group
    const idxGroup = groupTickerSymbols.indexOf(tickerSymbol);

    if (idxGroup <= idxGroupLastVisible) {
      return true;
    }

    if (idxGroup <= idxGroupLastVisible + 2) {
      return true;
    }

    return false;
  }, [tickerSymbol, groupTickerSymbols, visibleSymbols]);

  const handleFullRenderSymbolStateChange = useCallback(
    (isFullRenderSymbol: boolean) => {
      if (typeof onFullRenderSymbolStateChange === "function") {
        onFullRenderSymbolStateChange(isFullRenderSymbol);
      }
    },
    [onFullRenderSymbolStateChange]
  );

  useEffect(() => {
    handleFullRenderSymbolStateChange(isFullRenderSymbol);
  }, [isFullRenderSymbol, handleFullRenderSymbolStateChange]);

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
    <div ref={elementRef} {...rest}>
      {
        // TODO: Move this condition to the `SymbolContainer`
        !isFullRenderSymbol ? (
          <div
            style={{
              height: 500,
              // TODO: Remove? This should never be visible, anyway, if the `isFullRenderSymbol` algorithm is working correct
              backgroundColor: "yellow",
            }}
          />
        ) : (
          children
        )
      }
    </div>
  );
}
