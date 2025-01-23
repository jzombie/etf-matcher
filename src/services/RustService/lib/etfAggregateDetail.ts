import callRustService from "../callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerSymbol,
} from "../rustServiceTypes";

export async function fetchETFAggregateDetail(
  etfTickerSymbol: RustServiceTickerSymbol,
): Promise<RustServiceETFAggregateDetail> {
  return callRustService<RustServiceETFAggregateDetail>(
    "get_etf_aggregate_detail",
    [etfTickerSymbol],
  );
}
