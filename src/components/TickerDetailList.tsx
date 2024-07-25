import React, { useCallback, useEffect, useState } from "react";
import SymbolDetail from "./TickerDetail";

import customLogger from "@utils/customLogger";

export type TickerDetailListProps = {
  tickerIds: number[];
  lookAheadBufferSize?: number;
};

export default function TickerDetailList({
  tickerIds,
  lookAheadBufferSize = 2,
}: TickerDetailListProps) {
  useEffect(() => {
    if (tickerIds.length !== [...new Set(tickerIds)].length) {
      customLogger.warn(
        "`tickerIds` is not unique! Unpredictable results may occur."
      );
    }
  }, [tickerIds]);

  const [maxIntersectionIndex, setMaxIntersectionIndex] = useState<number>(0);

  const handleIntersectionStateChange = useCallback(
    (tickerId: number, isIntersecting: boolean) => {
      if (isIntersecting) {
        const intersectionIndex = tickerIds.indexOf(tickerId);

        if (intersectionIndex > maxIntersectionIndex) {
          setMaxIntersectionIndex(intersectionIndex);
        }
      }
    },
    [tickerIds, maxIntersectionIndex]
  );

  return (
    <>
      {tickerIds.map((tickerId, idx) => {
        if (idx <= maxIntersectionIndex + lookAheadBufferSize) {
          return (
            // TODO: Rename to `TickerDetail`

            <SymbolDetail
              key={tickerId}
              tickerId={tickerId}
              onIntersectionStateChange={(isIntersecting) =>
                handleIntersectionStateChange(tickerId, isIntersecting)
              }
            />
          );
        }
      })}
    </>
  );
}
