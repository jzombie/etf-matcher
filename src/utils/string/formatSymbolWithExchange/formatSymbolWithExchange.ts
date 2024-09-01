import type { RustServiceTickerDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

// Converts a symbol detail object into a formatted symbol with exchange identifier
export default function formatSymbolWithExchange(
  tickerDetail: RustServiceTickerDetail,
): string {
  if (!tickerDetail.symbol) {
    return "";
  }

  let exchangeShortName = tickerDetail.exchange_short_name;

  // FIXME: This may require additional debugging and it would be best to
  // modify the data source itself
  if (exchangeShortName === "ETF") {
    customLogger.debug(
      `Patching ETF short name with AMEX for symbol: ${tickerDetail.symbol}`,
    );

    exchangeShortName = "AMEX";
  }

  const exchangePrefix = exchangeShortName ? `${exchangeShortName}:` : "";

  const formattedSymbol = tickerDetail.symbol?.replaceAll("-", ".");

  return `${exchangePrefix}${formattedSymbol}`;
}
