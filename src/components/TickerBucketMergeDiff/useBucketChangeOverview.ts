import { useMemo } from "react";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

export type TickerDiff = {
  quantity: number;
  previousQuantity?: number;
  ticker: TickerBucketTicker;
};

export type BucketChangeOverviewProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
};

export default function useBucketChangeOverview({
  currentBucket,
  incomingBucket,
}: BucketChangeOverviewProps) {
  const bucketChangeOverview = useMemo(() => {
    const currentTickersMap = new Map<number, TickerBucketTicker>(
      currentBucket?.tickers.map((ticker) => [ticker.tickerId, ticker]) || [],
    );

    const result = {
      added: [] as TickerDiff[],
      updated: [] as TickerDiff[],
      unchanged: [] as TickerDiff[],
    };

    for (const incomingTicker of incomingBucket.tickers) {
      const existingTicker = currentTickersMap.get(incomingTicker.tickerId);
      if (!existingTicker) {
        // Ticker is new, will be added
        result.added.push({
          quantity: incomingTicker.quantity,
          ticker: incomingTicker,
        });
      } else if (existingTicker.quantity !== incomingTicker.quantity) {
        // Ticker exists but quantity is different, will be updated
        result.updated.push({
          quantity: incomingTicker.quantity,
          previousQuantity: existingTicker.quantity,
          ticker: incomingTicker,
        });
      } else {
        // Ticker exists and quantity is unchanged
        result.unchanged.push({
          quantity: incomingTicker.quantity,
          ticker: incomingTicker,
        });
      }
    }

    return result;
  }, [currentBucket, incomingBucket]);

  return bucketChangeOverview;
}
