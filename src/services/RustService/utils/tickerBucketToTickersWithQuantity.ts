import type { TickerBucket } from "@src/store";

import type { RustServiceTickerWithWeight } from "../rustServiceTypes";

export default function tickerBucketToTickersWithWeight(
  tickerBucket: TickerBucket,
): RustServiceTickerWithWeight[] {
  return tickerBucket.tickers.map((ticker) => ({
    ticker_symbol: ticker.symbol,
    weight: ticker.quantity,
  }));
}
