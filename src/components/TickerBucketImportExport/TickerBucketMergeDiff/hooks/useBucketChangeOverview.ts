import { useMemo } from "react";

import type { RustServiceTickerSymbol } from "@services/RustService";
import type { TickerBucket, TickerBucketTicker } from "@src/store";

export type TickerDiff = {
  previousQuantity?: number;
  ticker: TickerBucketTicker;
};

export type TickerBucketChangeOverviewProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
};

export type TickerBucketChangeOverviewResult = {
  [key in TickerBucketChangeActionTypes]: TickerDiff[];
};

export type TickerBucketChangeActionTypes =
  | "added"
  | "updated"
  | "unchanged"
  | "removed";

export default function useBucketChangeOverview({
  currentBucket,
  incomingBucket,
}: TickerBucketChangeOverviewProps) {
  const bucketChangeOverview = useMemo(() => {
    const currentTickersMap = new Map<
      RustServiceTickerSymbol,
      TickerBucketTicker
    >(currentBucket?.tickers.map((ticker) => [ticker.symbol, ticker]) || []);

    const incomingTickerSymbols = new Set<RustServiceTickerSymbol>(
      incomingBucket.tickers.map((ticker) => ticker.symbol),
    );

    const result: TickerBucketChangeOverviewResult = {
      added: [] as TickerDiff[],
      updated: [] as TickerDiff[],
      unchanged: [] as TickerDiff[],
      removed: [] as TickerDiff[],
    };

    for (const incomingTicker of incomingBucket.tickers) {
      const existingTicker = currentTickersMap.get(incomingTicker.symbol);
      if (!existingTicker) {
        // Ticker is new, will be added
        result.added.push({
          ticker: incomingTicker,
        });
      } else if (existingTicker.quantity !== incomingTicker.quantity) {
        // Ticker exists but quantity is different, will be updated
        result.updated.push({
          previousQuantity: existingTicker.quantity,
          ticker: incomingTicker,
        });
      } else {
        // Ticker exists and quantity is unchanged
        result.unchanged.push({
          ticker: incomingTicker,
        });
      }
    }

    // Check for removed tickers
    if (currentBucket) {
      for (const existingTicker of currentBucket.tickers) {
        if (!incomingTickerSymbols.has(existingTicker.symbol)) {
          result.removed.push({
            previousQuantity: existingTicker.quantity,
            ticker: existingTicker,
          });
        }
      }
    }

    return result;
  }, [currentBucket, incomingBucket]);

  return bucketChangeOverview;
}
