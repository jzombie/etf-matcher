import type { TickerBucket } from "@src/store";

import callRustService from "../callRustService";
import type { RustServiceTickerDistance } from "../types";
import tickerBucketToTickersWithQuantity from "../utils/tickerBucketToTickersWithQuantity";

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
  const rustServiceTickersWithQuantity =
    tickerBucketToTickersWithQuantity(tickerBucket);

  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker_bucket",
    [rustServiceTickersWithQuantity],
  );
}
