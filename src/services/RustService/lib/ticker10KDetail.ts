import type { TickerBucketTicker } from "@src/store";

import callRustService from "../callRustService";
import type {
  RustServiceTicker10KDetail,
  RustServiceTickerSymbol,
} from "../rustServiceTypes";

export async function fetchTicker10KDetail(
  tickerSymbol: RustServiceTickerSymbol,
): Promise<RustServiceTicker10KDetail> {
  return callRustService<RustServiceTicker10KDetail>("get_ticker_10k_detail", [
    tickerSymbol,
  ]);
}

export async function fetchWeightedTicker10KDetail(
  tickerBucketTickers: TickerBucketTicker[],
): Promise<RustServiceTicker10KDetail> {
  const tickerWeightPairs = tickerBucketTickers.map((ticker) => [
    ticker.symbol,
    ticker.quantity,
  ]);

  return callRustService<RustServiceTicker10KDetail>(
    "get_weighted_ticker_10k_detail",
    [tickerWeightPairs],
  );
}
