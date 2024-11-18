import callRustService from "../callRustService";

export async function fetchSymbolAndExchange(
  tickerId: number,
): Promise<[string, string]> {
  return callRustService("get_symbol_and_exchange_by_ticker_id", [tickerId]);
}
