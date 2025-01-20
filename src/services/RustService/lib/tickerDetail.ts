import type { TickerBucketTicker } from "@src/store";

import callRustService from "../callRustService";
import type {
  RustServiceTickerDetail,
  RustServiceTickerSymbol,
  RustServiceTickerWeightedSectorDistribution,
} from "../rustServiceTypes";

export async function fetchTickerDetail(
  tickerSymbol: RustServiceTickerSymbol,
): Promise<RustServiceTickerDetail> {
  return callRustService<RustServiceTickerDetail>("get_ticker_detail", [
    tickerSymbol,
  ]);
}

export async function fetchWeightedTickerSectorDistribution(
  tickerBucketTickers: TickerBucketTicker[],
): Promise<RustServiceTickerWeightedSectorDistribution> {
  const tickerWeightPairs = tickerBucketTickers.map((ticker) => [
    ticker.symbol,
    ticker.quantity,
  ]);

  return callRustService<RustServiceTickerWeightedSectorDistribution>(
    "get_weighted_ticker_sector_distribution",
    [tickerWeightPairs],
  );
}
