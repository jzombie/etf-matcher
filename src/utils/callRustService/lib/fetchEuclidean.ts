import type { TickerBucket } from "@src/store";

import callRustService from "../callRustService";
import type { RustServiceTickerDistance } from "../types";

export async function fetchEuclideanByTicker(
  tickerId: number,
): Promise<RustServiceTickerDistance[]> {
  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker",
    [tickerId],
  );
}

export async function fetchEuclideanByTickerBucket(
  tickerBucket: TickerBucket,
): Promise<RustServiceTickerDistance[]> {
  // TODO: Make this a helper method (see duplicate usage)
  // TODO: Define Rust translation type
  const rustServiceTickersWithQuantity = tickerBucket.tickers.map((ticker) => ({
    ticker_id: ticker.tickerId,
    quantity: ticker.quantity,
  }));

  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker_bucket",
    [rustServiceTickersWithQuantity],
  );
}
