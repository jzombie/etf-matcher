import callRustService from "../callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTicker,
  RustServiceETFHoldingWeight,
  RustServicePaginatedResults,
} from "../rustServiceTypes";

export async function fetchETFHoldings(
  tickerId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<RustServicePaginatedResults<RustServiceETFHoldingTicker>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceETFHoldingTicker>
  >("get_etf_holdings_by_etf_ticker_id", [tickerId, page, pageSize]);
}

export async function fetchETFHoldingWeight(
  etfTickerId: number,
  holdingTickerId: number,
): Promise<RustServiceETFHoldingWeight> {
  return callRustService<RustServiceETFHoldingWeight>(
    "get_etf_holding_weight",
    [etfTickerId, holdingTickerId],
  );
}

export async function fetchETFHoldersAggregateDetail(
  tickerId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<RustServicePaginatedResults<RustServiceETFAggregateDetail>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceETFAggregateDetail>
  >("get_etf_holders_aggregate_detail_by_ticker_id", [
    tickerId,
    page,
    pageSize,
  ]);
}
