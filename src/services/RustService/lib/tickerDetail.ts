import type { TickerBucketTicker } from "@src/store";

import callRustService from "../callRustService";
import type { RustServiceTickerDetail } from "../rustServiceTypes";
import type { RustServiceTickerWeightedSectorDistribution } from "../rustServiceTypes";

export async function fetchTickerDetail(
  tickerId: number,
): Promise<RustServiceTickerDetail> {
  return callRustService<RustServiceTickerDetail>("get_ticker_detail", [
    tickerId,
  ]);
}

export async function fetchWeightedTickerSectorDistribution(
  tickerBucketTickers: TickerBucketTicker[],
): Promise<RustServiceTickerWeightedSectorDistribution> {
  const tickerWeightPairs = tickerBucketTickers.map((ticker) => [
    ticker.tickerId,
    ticker.quantity,
  ]);

  return callRustService<RustServiceTickerWeightedSectorDistribution>(
    "get_weighted_ticker_sector_distribution",
    [tickerWeightPairs],
  );
}
