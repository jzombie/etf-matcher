import React, { useCallback, useEffect, useRef, useState } from "react";
import SymbolDetail from "./SymbolDetail";

export type SymbolDetailListProps = {
  tickerSymbols: string[];
  lookAheadBufferSize?: number;
  // lookAheadMaskStyle?: React.HTMLAttributes<HTMLDivElement>["style"];
};

export default function SymbolDetailList({
  tickerSymbols,
  lookAheadBufferSize = 2,
}: // lookAheadMaskStyle = {
//   height: 500,
// },
SymbolDetailListProps) {
  useEffect(() => {
    if (tickerSymbols.length !== [...new Set(tickerSymbols)].length) {
      console.warn(
        "`groupTickerSymbols` is not unique! Unpredictable results may occur."
      );
    }
  }, [tickerSymbols]);

  // const [intersectingSymbols, setIntersectingSymbols] = useState<string[]>([]);
  // const [renderingIndex, setRenderingIndex] = useState<number>(0);
  // const maxInter = useRef<number>(-1);
  const [maxIntersectionIndex, setMaxIntersectionIndex] = useState<number>(0);

  const handleIntersectionStateChange = useCallback(
    (tickerSymbol: string, isIntersecting: boolean) => {
      // setIntersectingSymbols((prevSymbols) => {
      //   const updatedSymbols = [...prevSymbols];
      //   const index = updatedSymbols.indexOf(tickerSymbol);
      //   if (isIntersecting) {
      //     if (index === -1) {
      //       updatedSymbols.push(tickerSymbol);
      //     }
      //   } else {
      //     if (index !== -1) {
      //       updatedSymbols.splice(index, 1);
      //     }
      //   }
      //   return updatedSymbols.sort(
      //     (a, b) => tickerSymbols.indexOf(a) - tickerSymbols.indexOf(b)
      //   );
      // });

      if (isIntersecting) {
        const intersectionIndex = tickerSymbols.indexOf(tickerSymbol);

        if (intersectionIndex > maxIntersectionIndex) {
          setMaxIntersectionIndex(intersectionIndex);
        }
      }
    },
    [tickerSymbols, maxIntersectionIndex]
  );

  // useEffect(() => {
  //   const lastIntersectingSymbol = intersectingSymbols.at(-1);
  //   if (!lastIntersectingSymbol) {
  //     return;
  //   }

  //   const idxGroupLastIntersecting = tickerSymbols.indexOf(
  //     lastIntersectingSymbol
  //   );

  //   if (idxGroupLastIntersecting > maxIdxLastIntersecting.current) {
  //     maxIdxLastIntersecting.current = idxGroupLastIntersecting;
  //   }

  //   console.log({ max: maxIdxLastIntersecting.current });
  // }, [intersectingSymbols, tickerSymbols]);

  console.log({ maxIntersectionIndex });

  return (
    <>
      {tickerSymbols.map((tickerSymbol, idx) => {
        if (idx <= maxIntersectionIndex + lookAheadBufferSize) {
          return (
            <SymbolDetail
              key={tickerSymbol}
              tickerSymbol={tickerSymbol}
              onIntersectionStateChange={(isIntersecting) =>
                handleIntersectionStateChange(tickerSymbol, isIntersecting)
              }
            />
          );
        }
        /*else {
          return (
            <div
              key={tickerSymbol}
              style={{
                ...lookAheadMaskStyle,
              }}
            />
          );
        }*/
      })}
    </>
  );
}
