import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SymbolDetail from "./SymbolDetail";

export type SymbolDetailListProps = {
  tickerSymbols: string[];
  // onDeferredRenderStateChange?: (isDeferredRender: boolean) => void;
  lookAheadBufferSize?: number;
  lookAheadMaskStyle?: React.HTMLAttributes<HTMLDivElement>["style"];
};

export default function SymbolDetailList({
  tickerSymbols,
  lookAheadBufferSize = 2,
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

  // Note: This should not be confused with `visibleSymbols` in the store state.
  // `intersectingSymbols` refers to this component only, and `visibleSymbols` refers
  // to the entire app.
  const [intersectingSymbols, setIntersectingSymbols] = useState<string[]>([]);

  const handleIntersectionStateChange = useCallback(
    (tickerSymbol: string, isIntersecting: boolean) => {
      console.log({ tickerSymbol, isIntersecting });

      setIntersectingSymbols((prevSymbols) => {
        const updatedSymbols = [...prevSymbols];
        const index = updatedSymbols.indexOf(tickerSymbol);
        if (isIntersecting) {
          if (index === -1) {
            updatedSymbols.push(tickerSymbol);
          }
        } else {
          if (index !== -1) {
            updatedSymbols.splice(index, 1);
          }
        }
        // Sort the updatedSymbols array based on the order of tickerSymbols
        return updatedSymbols.sort(
          (a, b) => tickerSymbols.indexOf(a) - tickerSymbols.indexOf(b)
        );
      });
    },
    [tickerSymbols]
  );

  const maxIdxLastIntersecting = useRef<number>(-1);

  useEffect(() => {
    const lastIntersectingSymbol = intersectingSymbols.at(-1);

    // TODO: Debug; this should only happen at initial mount stage
    if (!lastIntersectingSymbol) {
      return;
    }

    const idxGroupLastIntersecting = tickerSymbols.indexOf(
      lastIntersectingSymbol
    );

    if (idxGroupLastIntersecting > maxIdxLastIntersecting.current) {
      maxIdxLastIntersecting.current = idxGroupLastIntersecting;

      // console.debug({
      //   maxIdxPrevVisibleSymbol: maxIdxPrevVisibleSymbolRef.current,
      //   lack: groupTickerSymbols.length - maxIdxPrevVisibleSymbolRef.current,
      // });
    }

    console.log({ max: maxIdxLastIntersecting.current });
  }, [intersectingSymbols, tickerSymbols]);

  return (
    <>
      {tickerSymbols.map((tickerSymbol, idx) => {
        if (idx <= maxIdxLastIntersecting.current + lookAheadBufferSize) {
          return (
            <SymbolDetail
              key={tickerSymbol}
              tickerSymbol={tickerSymbol}
              onIntersectionStateChange={(isIntersecting) =>
                handleIntersectionStateChange(tickerSymbol, isIntersecting)
              }
            />
          );
        } else {
          return (
            <div
              key={tickerSymbol}
              style={{
                ...lookAheadMaskStyle,
                // backgroundColor: "yellow",
              }}
            />
          );
        }
      })}
    </>
  );
}
