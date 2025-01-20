import callRustService from "../callRustService";
import type { RustServiceTickerSymbol } from "../rustServiceTypes";

// TODO: Rename (and refactor) to `fetchTickerExchange`
export async function fetchSymbolAndExchange(
  tickerSymbol: RustServiceTickerSymbol,
): Promise<[RustServiceTickerSymbol, string]> {
  return callRustService("get_symbol_and_exchange_by_ticker_id", [
    tickerSymbol,
  ]);
}
