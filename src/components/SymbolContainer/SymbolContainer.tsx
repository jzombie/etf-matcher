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
  lookAheadBufferSize?: number;
  lookAheadMaskStyle?: React.HTMLAttributes<HTMLDivElement>["style"];
};

export default function SymbolContainer({
  tickerSymbol,
  groupTickerSymbols,
  children,
  onFullRenderSymbolStateChange,
  lookAheadBufferSize = 1,
  lookAheadMaskStyle = {
    height: 500,
  },
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

  const shouldRenderSymbol = useMemo(() => {
    if (visibleSymbols.includes(tickerSymbol)) {
      return true;
    }

    const lastVisibleSymbol = visibleSymbols.at(-1);

    if (lastVisibleSymbol === undefined) {
      return false;
    }

    // Where the last currently visible symbol lies in the group
    const idxGroupLastVisible = groupTickerSymbols.indexOf(lastVisibleSymbol);

    if (idxGroupLastVisible > maxIdxPrevVisibleSymbolRef.current) {
      maxIdxPrevVisibleSymbolRef.current = idxGroupLastVisible;

      // console.debug({
      //   maxIdxPrevVisibleSymbol: maxIdxPrevVisibleSymbolRef.current,
      //   lack: groupTickerSymbols.length - maxIdxPrevVisibleSymbolRef.current,
      // });
    }

    // Where the symbol lies in the group
    const idxGroup = groupTickerSymbols.indexOf(tickerSymbol);

    if (idxGroup <= maxIdxPrevVisibleSymbolRef.current + lookAheadBufferSize) {
      return true;
    }

    return false;
  }, [tickerSymbol, groupTickerSymbols, visibleSymbols, lookAheadBufferSize]);

  const handleFullRenderSymbolStateChange = useCallback(
    (isFullRenderSymbol: boolean) => {
      if (typeof onFullRenderSymbolStateChange === "function") {
        onFullRenderSymbolStateChange(isFullRenderSymbol);
      }
    },
    [onFullRenderSymbolStateChange]
  );

  useEffect(() => {
    handleFullRenderSymbolStateChange(shouldRenderSymbol);
  }, [shouldRenderSymbol, handleFullRenderSymbolStateChange]);

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
      {!shouldRenderSymbol ? <div style={lookAheadMaskStyle} /> : children}
    </div>
  );
}
