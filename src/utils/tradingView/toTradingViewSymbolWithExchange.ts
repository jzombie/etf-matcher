import type { RustServiceSymbolDetail } from "@utils/callWorkerFunction";

// TODO: This needs unit tests
export default function toTradingViewSymbolWithExchange(
  symbolDetail?: RustServiceSymbolDetail
): string | void {
  if (!symbolDetail) {
    return;
  }

  const symbolWithExchange = `${
    symbolDetail?.exchange_short_name
      ? `${symbolDetail?.exchange_short_name}:`
      : ""
  }${symbolDetail?.symbol.replaceAll("-", ".")}`;

  return symbolWithExchange;
}
