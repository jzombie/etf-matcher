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

  // TODO: This doesn't apply SPECIFICALLY to this list, so this needs refinement!
  // const { visibleSymbols } = useStoreStateReader(["visibleSymbols"]);

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

  //   if (idxGroup <= maxIdxPrevVisibleSymbolRef.current + lookAheadBufferSize) {
  //     return true;
  //   }

  //   return false;
  // }, [tickerSymbol, groupTickerSymbols, intersectingSymbols, lookAheadBufferSize]);

  // TODO: Don't hardcode
  // const isDeferredRender = false;

  // const handleDeferredRenderStateChange = useCallback(
  //   (isDeferredRender: boolean) => {
  //     if (typeof onDeferredRenderStateChange === "function") {
  //       onDeferredRenderStateChange(isDeferredRender);
  //     }
  //   },
  //   [onDeferredRenderStateChange]
  // );

  // useEffect(() => {
  //   handleDeferredRenderStateChange(isDeferredRender);
  // }, [isDeferredRender, handleDeferredRenderStateChange]);

  return (
    <>
      {tickerSymbols.map((tickerSymbol, idx) => {
        // if (idx <= maxIdxLastIntersecting.current + lookAheadBufferSize) {
        return (
          <SymbolDetail
            key={tickerSymbol}
            tickerSymbol={tickerSymbol}
            onIntersectionStateChange={(isIntersecting) =>
              handleIntersectionStateChange(tickerSymbol, isIntersecting)
            }
          />
        );
        // } else {
        //   return (
        //     <div
        //       key={tickerSymbol}
        //       style={{ ...lookAheadMaskStyle, backgroundColor: "yellow" }}
        //     />
        //   );
        // }
      })}
    </>
  );
}
