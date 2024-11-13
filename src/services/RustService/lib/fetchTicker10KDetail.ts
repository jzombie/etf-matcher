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
  tickerIds: number[],
  tickerWeights: number[],
): Promise<RustServiceTicker10KDetail> {
  // Combine tickerIds and tickerWeights into an array of [TickerId, weight] pairs
  const tickerWeightPairs = tickerIds.map((id, index) => [
    id,
    tickerWeights[index],
  ]);

  return callRustService<RustServiceTicker10KDetail>(
    "get_weighted_ticker_10k_detail",
    [tickerWeightPairs],
  );
}
