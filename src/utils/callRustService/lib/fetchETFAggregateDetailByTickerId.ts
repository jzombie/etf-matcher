import callRustService from "../callRustService";
import type { RustServiceETFAggregateDetail } from "../types";

export default async function fetchETFAggregateDetailByTickerId(
  etfTickerId: number,
): Promise<RustServiceETFAggregateDetail> {
  return callRustService<RustServiceETFAggregateDetail>(
    "get_etf_aggregate_detail_by_ticker_id",
    [etfTickerId],
  );
}