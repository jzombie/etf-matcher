import type { RustServiceTickerDetail } from "@src/types";

// Converts a symbol detail object into a formatted symbol with exchange identifier
export default function formatSymbolWithExchange(
  tickerDetail: RustServiceTickerDetail,
): string {
  if (!tickerDetail.symbol) {
    return "";
  }

  const exchangePrefix = tickerDetail.exchange_short_name
    ? `${tickerDetail.exchange_short_name}:`
    : "";

  const formattedSymbol = tickerDetail.symbol?.replaceAll("-", ".");

  return `${exchangePrefix}${formattedSymbol}`;
}
