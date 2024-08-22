import React, { useEffect } from "react";

import store from "@src/store";

import customLogger from "@utils/customLogger";

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  useEffect(() => {
    if (tickerId) {
      store.fetchClosestTickers(tickerId).then(async (closestTickers) => {
        const detailPromises = closestTickers.map((item) =>
          store.fetchTickerDetail(item.ticker_id),
        );
        const details = await Promise.allSettled(detailPromises);

        // TODO: Handle
        customLogger.log({ details, closestTickers });
      });
    }
  }, [tickerId]);

  return <div>[TickerVectorTable]</div>;
}
