import React, { useCallback, useEffect, useState } from "react";

import customLogger from "@utils/customLogger";

import TickerDetail from "./TickerDetail";

export type TickerDetailListProps = {
  tickerIds: number[];
  lookAheadBufferSize?: number;
  // Note: This executes on every `TickerDetail` load. Adjust as necessary
  // if the ticker information should be sent as an argument.
  onLoad?: () => void;
};

export default function TickerDetailList({
  tickerIds,
  lookAheadBufferSize = 2,
  onLoad,
}: TickerDetailListProps) {
  useEffect(() => {
    if (tickerIds.length !== [...new Set(tickerIds)].length) {
      customLogger.warn(
        "`tickerIds` is not unique! Unpredictable results may occur.",
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
    [tickerIds, maxIntersectionIndex],
  );

  return (
    <>
      {tickerIds.map((tickerId, idx) => {
        if (idx <= maxIntersectionIndex + lookAheadBufferSize) {
          return (
            <TickerDetail
              key={tickerId}
              tickerId={tickerId}
              onIntersectionStateChange={(isIntersecting) =>
                handleIntersectionStateChange(tickerId, isIntersecting)
              }
              onLoad={onLoad}
              // Prevent stacked-up loading spinners
              preventLoadingSpinner={idx > 0}
            />
          );
        }
      })}
    </>
  );
}
