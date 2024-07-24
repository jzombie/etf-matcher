import type { RustServiceTickerDetail } from "@utils/callRustService";

// Converts a symbol detail object into a formatted symbol with exchange identifier
export default function formatSymbolWithExchange(
  symbolDetail: RustServiceTickerDetail
): string {
  if (!symbolDetail.symbol) {
    return "";
  }

  const exchangePrefix = symbolDetail.exchange_short_name
    ? `${symbolDetail.exchange_short_name}:`
    : "";

  const formattedSymbol = symbolDetail.symbol?.replaceAll("-", ".");

  return `${exchangePrefix}${formattedSymbol}`;
}
