import { describe, it, expect } from "vitest";
import formatSymbolWithExchange from "./formatSymbolWithExchange";
import type { RustServiceTickerDetail } from "@src/types";

describe("formatSymbolWithExchange", () => {
  it("should format symbol with exchange prefix", () => {
    const tickerDetail = {
      symbol: "AAPL",
      exchange_short_name: "NASDAQ",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("NASDAQ:AAPL");
  });

  it("should handle undefined exchange_short_name", () => {
    const tickerDetail = {
      symbol: "AAPL",
      exchange_short_name: undefined,
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should handle null exchange_short_name", () => {
    const tickerDetail = {
      symbol: "AAPL",
      exchange_short_name: null,
    } as unknown as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should format symbol without exchange prefix if exchange_short_name is empty", () => {
    const tickerDetail = {
      symbol: "AAPL",
      exchange_short_name: "",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("AAPL");
  });

  it("should replace hyphens with dots in symbol", () => {
    const tickerDetail = {
      symbol: "BRK-B",
      exchange_short_name: "NYSE",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("NYSE:BRK.B");
  });

  it("should handle symbol with no exchange_short_name and hyphens", () => {
    const tickerDetail = {
      symbol: "BRK-B",
      exchange_short_name: "",
    } as RustServiceTickerDetail;

    const result = formatSymbolWithExchange(tickerDetail);
    expect(result).toBe("BRK.B");
  });

  it("should return empty string if symbol is empty", () => {
    const tickerDetail = {
      symbol: "",
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
});
