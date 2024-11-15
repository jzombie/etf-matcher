import type { TickerBucket } from "@src/store";

import type { RustServiceTickerWithWeight } from "../rustServiceTypes";

export default function tickerBucketToTickersWithWeight(
  tickerBucket: TickerBucket,
): RustServiceTickerWithWeight[] {
  return tickerBucket.tickers.map((ticker) => ({
    ticker_id: ticker.tickerId,
    weight: ticker.quantity,
  }));
}
