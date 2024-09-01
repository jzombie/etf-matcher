import callRustService from "../callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTickerResponse,
  RustServiceETFHoldingWeightResponse,
  RustServicePaginatedResults,
} from "../types";

export async function fetchETFHoldingsByETFTickerId(
  tickerId: number,
  page: number = 1,
  pageSize: number = 20,
): Promise<RustServicePaginatedResults<RustServiceETFHoldingTickerResponse>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceETFHoldingTickerResponse>
  >("get_etf_holdings_by_etf_ticker_id", [tickerId, page, pageSize]);
}

export async function fetchETFHoldingWeight(
  etfTickerId: number,
  holdingTickerId: number,
): Promise<RustServiceETFHoldingWeightResponse> {
  return callRustService<RustServiceETFHoldingWeightResponse>(
    "get_etf_holding_weight",
    [etfTickerId, holdingTickerId],
  );
}

export async function fetchETFHoldersAggregateDetailByTickerId(
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
