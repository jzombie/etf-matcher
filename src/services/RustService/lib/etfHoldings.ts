import callRustService from "../callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTicker,
  RustServiceETFHoldingWeight,
  RustServicePaginatedResults,
} from "../rustServiceTypes";

export async function fetchETFHoldings(
  tickerSymbol: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<RustServicePaginatedResults<RustServiceETFHoldingTicker>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceETFHoldingTicker>
  >("get_etf_holdings_by_etf_ticker_id", [tickerSymbol, page, pageSize]);
}

export async function fetchETFHoldingWeight(
  etfTickerSymbol: string,
  holdingTickerId: number,
): Promise<RustServiceETFHoldingWeight> {
  return callRustService<RustServiceETFHoldingWeight>(
    "get_etf_holding_weight",
    [etfTickerSymbol, holdingTickerId],
  );
}

export async function fetchETFHoldersAggregateDetail(
  tickerSymbol: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<RustServicePaginatedResults<RustServiceETFAggregateDetail>> {
  // TODO: Rename Rust function (no longer `ticker_id`)
  return callRustService<
    RustServicePaginatedResults<RustServiceETFAggregateDetail>
  >("get_etf_holders_aggregate_detail_by_ticker_id", [
    tickerSymbol,
    page,
    pageSize,
  ]);
}
