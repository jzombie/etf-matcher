import callRustService from "../callRustService";

// TODO: Rename (and refactor) to `fetchTickerExchange`
export async function fetchSymbolAndExchange(
  tickerSymbol: string,
): Promise<[string, string]> {
  return callRustService("get_symbol_and_exchange_by_ticker_id", [
    tickerSymbol,
  ]);
}
