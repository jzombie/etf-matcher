import React, { useCallback, useEffect, useState } from "react";
import SymbolDetail from "./SymbolDetail";

import customLogger from "@utils/customLogger";

export type SymbolDetailListProps = {
  tickerSymbols: string[];
  lookAheadBufferSize?: number;
};

// TODO: This should use exchanges as well, for greater accuracy
export default function SymbolDetailList({
  tickerSymbols,
  lookAheadBufferSize = 2,
}: SymbolDetailListProps) {
  useEffect(() => {
    if (tickerSymbols.length !== [...new Set(tickerSymbols)].length) {
      customLogger.warn(
        "`tickerSymbols` is not unique! Unpredictable results may occur."
      );
    }
  }, [tickerSymbols]);

  const [maxIntersectionIndex, setMaxIntersectionIndex] = useState<number>(0);

  const handleIntersectionStateChange = useCallback(
    (tickerSymbol: string, isIntersecting: boolean) => {
      if (isIntersecting) {
        const intersectionIndex = tickerSymbols.indexOf(tickerSymbol);

        if (intersectionIndex > maxIntersectionIndex) {
          setMaxIntersectionIndex(intersectionIndex);
        }
      }
    },
    [tickerSymbols, maxIntersectionIndex]
  );

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
      })}
    </>
  );
}
