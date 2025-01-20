import callRustService from "../callRustService";
import type { RustServiceTickerSymbol } from "../rustServiceTypes";

export async function fetchTickerId(
  tickerSymbol: RustServiceTickerSymbol,
): Promise<number> {
  return callRustService<number>("get_ticker_id", [tickerSymbol]);
}
