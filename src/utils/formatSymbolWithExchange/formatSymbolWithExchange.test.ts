import { describe, it, expect } from "vitest";
import formatSymbolWithExchange from "./formatSymbolWithExchange";
import type { RustServiceSymbolDetail } from "@utils/callRustService";

describe("formatSymbolWithExchange", () => {
  it("should format symbol with exchange prefix", () => {
    const symbolDetail = {
      symbol: "AAPL",
      exchange_short_name: "NASDAQ",
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("NASDAQ:AAPL");
  });

  it("should handle undefined exchange_short_name", () => {
    const symbolDetail = {
      symbol: "AAPL",
      exchange_short_name: undefined,
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("AAPL");
  });

  it("should handle null exchange_short_name", () => {
    const symbolDetail = {
      symbol: "AAPL",
      exchange_short_name: null,
    } as unknown as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("AAPL");
  });

  it("should format symbol without exchange prefix if exchange_short_name is empty", () => {
    const symbolDetail = {
      symbol: "AAPL",
      exchange_short_name: "",
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("AAPL");
  });

  it("should replace hyphens with dots in symbol", () => {
    const symbolDetail = {
      symbol: "BRK-B",
      exchange_short_name: "NYSE",
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("NYSE:BRK.B");
  });

  it("should handle symbol with no exchange_short_name and hyphens", () => {
    const symbolDetail = {
      symbol: "BRK-B",
      exchange_short_name: "",
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("BRK.B");
  });

  it("should return empty string if symbol is empty", () => {
    const symbolDetail = {
      symbol: "",
      exchange_short_name: "NASDAQ",
    } as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("");
  });

  it("should handle undefined symbol", () => {
    const symbolDetail = {
      symbol: undefined,
      exchange_short_name: "NASDAQ",
    } as unknown as RustServiceSymbolDetail;

    const result = formatSymbolWithExchange(symbolDetail);
    expect(result).toBe("");
  });
});
