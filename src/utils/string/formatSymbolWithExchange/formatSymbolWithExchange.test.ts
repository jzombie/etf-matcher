import type { RustServiceTickerDetail } from "@services/RustService";
import { describe, expect, it } from "vitest";

import formatSymbolWithExchange from "./formatSymbolWithExchange";

describe("formatSymbolWithExchange", () => {
  it("should format symbol with exchange prefix", () => {
    const tickerDetail = {
      ticker_symbol: "AAPL",
      exchange_short_name: "NASDAQ",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("NASDAQ:AAPL");
  });

  it("should handle undefined exchange_short_name", () => {
    const tickerDetail = {
      ticker_symbol: "AAPL",
      exchange_short_name: undefined,
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should handle null exchange_short_name", () => {
    const tickerDetail = {
      ticker_symbol: "AAPL",
      exchange_short_name: null,
    } as unknown as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should format symbol without exchange prefix if exchange_short_name is empty", () => {
    const tickerDetail = {
      ticker_symbol: "AAPL",
      exchange_short_name: "",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should replace hyphens with dots in symbol", () => {
    const tickerDetail = {
      ticker_symbol: "BRK-B",
      exchange_short_name: "NYSE",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("NYSE:BRK.B");
  });

  it("should handle symbol with no exchange_short_name and hyphens", () => {
    const tickerDetail = {
      ticker_symbol: "BRK-B",
      exchange_short_name: "",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("BRK.B");
  });

  it("should return empty string if symbol is empty", () => {
    const tickerDetail = {
      ticker_symbol: "",
      exchange_short_name: "NASDAQ",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("");
  });

  it("should handle undefined symbol", () => {
    const tickerDetail = {
      symbol: undefined,
      exchange_short_name: "NASDAQ",
    } as unknown as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("");
  });

  it("should override exchange short name to AMEX for ETFs", () => {
    const tickerDetail = {
      ticker_symbol: "SPY",
      exchange_short_name: "ETF",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AMEX:SPY");
  });
});
