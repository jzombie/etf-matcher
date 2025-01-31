import type { RustServiceTickerDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

// TODO: Modify for third-party service rendering. For example, the current implementation
// is specific to `TradingView`.
//
// Converts a symbol detail object into a formatted symbol with exchange identifier
export default function formatSymbolWithExchange(
  tickerDetail: RustServiceTickerDetail,
): string {
  if (!tickerDetail.ticker_symbol) {
    return "";
  }

  let exchangeShortName = tickerDetail.exchange_short_name;

  // FIXME: This may require additional debugging and it would be best to
  // modify the data source itself
  if (exchangeShortName === "ETF") {
    customLogger.debug(
      `Patching ETF short name with AMEX for symbol: ${tickerDetail.ticker_symbol}`,
    );

    exchangeShortName = "AMEX";
  }

  const exchangePrefix = exchangeShortName ? `${exchangeShortName}:` : "";

  const formattedSymbol = tickerDetail.ticker_symbol?.replaceAll("-", ".");

  return `${exchangePrefix}${formattedSymbol}`;
}
