import type { TickerBucketTicker } from "@src/store";

import callRustService from "../callRustService";
import type { RustServiceTicker10KDetail } from "../rustServiceTypes";

export default async function fetchTicker10KDetail(
  tickerId: number,
): Promise<RustServiceTicker10KDetail> {
  return callRustService<RustServiceTicker10KDetail>("get_ticker_10k_detail", [
    tickerId,
  ]);
}

export function fetchWeightedTicker10KDetail(
  tickerBucketTickers: TickerBucketTicker[],
): Promise<RustServiceTicker10KDetail> {
  const tickerWeightPairs = tickerBucketTickers.map((ticker) => [
    ticker.tickerId,
    ticker.quantity,
  ]);

  return callRustService<RustServiceTicker10KDetail>(
    "get_weighted_ticker_10k_detail",
    [tickerWeightPairs],
  );
}
