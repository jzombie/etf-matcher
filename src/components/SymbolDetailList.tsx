import React, { useCallback, useEffect, useState } from "react";
import SymbolDetail from "./SymbolDetail";

import customLogger from "@utils/customLogger";

export type SymbolDetailListProps = {
  tickerIds: number[];
  lookAheadBufferSize?: number;
};

// TODO: This should use exchanges as well, for greater accuracy
export default function SymbolDetailList({
  tickerIds,
  lookAheadBufferSize = 2,
}: SymbolDetailListProps) {
  useEffect(() => {
    if (tickerIds.length !== [...new Set(tickerIds)].length) {
      customLogger.warn(
        "`tickerIds` is not unique! Unpredictable results may occur."
      );
    }
  }, [tickerIds]);

  // const tickerSymbols = tickerDetailList.map(({ symbol }) => symbol);

  // const [maxIntersectionIndex, setMaxIntersectionIndex] = useState<number>(0);

  // const handleIntersectionStateChange = useCallback(
  //   (tickerSymbol: string, isIntersecting: boolean) => {
  //     if (isIntersecting) {
  //       const intersectionIndex = tickerSymbols.indexOf(tickerSymbol);

  //       if (intersectionIndex > maxIntersectionIndex) {
  //         setMaxIntersectionIndex(intersectionIndex);
  //       }
  //     }
  //   },
  //   [tickerSymbols, maxIntersectionIndex]
  // );

  return (
    <>
      {tickerIds.map((tickerId, idx) => {
        // TODO: Uncomment
        // if (idx <= maxIntersectionIndex + lookAheadBufferSize) {
        return (
          // TODO: Rename to `TickerDetail`

          <SymbolDetail
            key={tickerId}
            tickerId={tickerId}
            // TODO: Uncomment
            // onIntersectionStateChange={(isIntersecting) =>
            //   handleIntersectionStateChange(
            //     tickerDetail.symbol,
            //     isIntersecting
            //   )
            // }
          />
        );
        // }
      })}
    </>
  );
}
