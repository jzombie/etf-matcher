import callRustService from "../callRustService";

export default async function fetchTickerId(
  tickerSymbol: string,
  exchangeShortName: string,
): Promise<number> {
  return callRustService<number>("get_ticker_id", [
    tickerSymbol,
    exchangeShortName,
  ]);
}
