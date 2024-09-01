import type { TickerBucket } from "@src/store";

import type { RustServiceTickerWithQuantity } from "../types";

export default function tickerBucketToTickersWithQuantity(
  tickerBucket: TickerBucket,
): RustServiceTickerWithQuantity[] {
  return tickerBucket.tickers.map((ticker) => ({
    ticker_id: ticker.tickerId,
    quantity: ticker.quantity,
  }));
}
