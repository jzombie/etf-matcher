import React, { useCallback, useEffect, useRef } from "react";
import SymbolDetail from "./SymbolDetail";

export type SymbolDetailListProps = {
  tickerSymbols: string[];
  onDeferredRenderStateChange?: (isDeferredRender: boolean) => void;
  lookAheadBufferSize?: number;
  lookAheadMaskStyle?: React.HTMLAttributes<HTMLDivElement>["style"];
};

export default function SymbolDetailList({
  tickerSymbols,
  onDeferredRenderStateChange,
  lookAheadBufferSize = 1,
  lookAheadMaskStyle = {
    height: 500,
  },
}: SymbolDetailListProps) {
  // Add prop validation
  useEffect(() => {
    // Validate groupTickerSymbols is unique
    if (tickerSymbols.length !== [...new Set(tickerSymbols)].length) {
      console.warn(
        "`groupTickerSymbols` is not unique! Unpredictable results may occur."
      );
    }
  }, [tickerSymbols]);

  // TODO: This doesn't apply SPECIFICALLY to this list, so this needs refinement!
  // const { visibleSymbols } = useStoreStateReader(["visibleSymbols"]);

  const maxIdxPrevVisibleSymbolRef = useRef<number>(-1);

  // Track whether the ticker symbol should be rendered immediately or deferred until it is scrolled into view.
  // This approach minimizes unnecessary network calls by only fetching data when the ticker symbol is visible.
  // const isDeferredRender = useMemo(() => {
  //   if (visibleSymbols.includes(tickerSymbol)) {
  //     return true;
  //   }

  //   const lastVisibleSymbol = visibleSymbols.at(-1);

  //   if (lastVisibleSymbol === undefined) {
  //     return false;
  //   }

  //   // Where the last currently visible symbol lies in the group
  //   const idxGroupLastVisible = groupTickerSymbols.indexOf(lastVisibleSymbol);

  //   if (idxGroupLastVisible > maxIdxPrevVisibleSymbolRef.current) {
  //     maxIdxPrevVisibleSymbolRef.current = idxGroupLastVisible;

  //     // console.debug({
  //     //   maxIdxPrevVisibleSymbol: maxIdxPrevVisibleSymbolRef.current,
  //     //   lack: groupTickerSymbols.length - maxIdxPrevVisibleSymbolRef.current,
  //     // });
  //   }

  //   // Where the symbol lies in the group
  //   const idxGroup = groupTickerSymbols.indexOf(tickerSymbol);

  //   if (
  //     idxGroup <=
  //     maxIdxPrevVisibleSymbolRef.current + lookAheadBufferSize
  //   ) {
  //     return true;
  //   }

  //   return false;
  // }, [tickerSymbol, groupTickerSymbols, visibleSymbols, lookAheadBufferSize]);

  // TODO: Don't hardcode
  const isDeferredRender = false;

  const handleDeferredRenderStateChange = useCallback(
    (isDeferredRender: boolean) => {
      if (typeof onDeferredRenderStateChange === "function") {
        onDeferredRenderStateChange(isDeferredRender);
      }
    },
    [onDeferredRenderStateChange]
  );

  // useEffect(() => {
  //   handleDeferredRenderStateChange(isDeferredRender);
  // }, [isDeferredRender, handleDeferredRenderStateChange]);

  return <></>;
}
