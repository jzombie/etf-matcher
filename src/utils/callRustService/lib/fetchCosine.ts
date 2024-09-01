import type { TickerBucket } from "@src/store";

import callRustService from "../callRustService";
import type { RustServiceCosineSimilarityResult } from "../types";

export async function fetchCosineByTicker(
  tickerId: number,
): Promise<RustServiceCosineSimilarityResult[]> {
  return callRustService<RustServiceCosineSimilarityResult[]>(
    "get_cosine_by_ticker",
    [tickerId],
  );
}

export async function fetchCosineByTickerBucket(
  tickerBucket: TickerBucket,
): Promise<RustServiceCosineSimilarityResult[]> {
  // TODO: Make this a helper method (see duplicate usage)
  // TODO: Define Rust translation type
  const rustServiceTickersWithQuantity = tickerBucket.tickers.map((ticker) => ({
    ticker_id: ticker.tickerId,
    quantity: ticker.quantity,
  }));

  return callRustService("get_cosine_by_ticker_bucket", [
    rustServiceTickersWithQuantity,
  ]);
}
