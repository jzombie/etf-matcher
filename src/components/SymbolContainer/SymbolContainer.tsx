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
  onDeferredRenderStateChange?: (isDeferredRender: boolean) => void;
  lookAheadBufferSize?: number;
  lookAheadMaskStyle?: React.HTMLAttributes<HTMLDivElement>["style"];
};

export default function SymbolContainer({
  tickerSymbol,
  groupTickerSymbols,
  children,
  onDeferredRenderStateChange,
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

  // Track whether the ticker symbol should be rendered immediately or deferred until it is scrolled into view.
  // This approach minimizes unnecessary network calls by only fetching data when the ticker symbol is visible.
  const isDeferredRender = useMemo(() => {
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

  const handleDeferredRenderStateChange = useCallback(
    (isFullRenderSymbol: boolean) => {
      if (typeof onDeferredRenderStateChange === "function") {
        onDeferredRenderStateChange(isFullRenderSymbol);
      }
    },
    [onDeferredRenderStateChange]
  );

  useEffect(() => {
    handleDeferredRenderStateChange(isDeferredRender);
  }, [isDeferredRender, handleDeferredRenderStateChange]);

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
      {!isDeferredRender ? <div style={lookAheadMaskStyle} /> : children}
    </div>
  );
}
