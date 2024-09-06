import type { StoreStateProps } from "@src/store";

export const INVESTMENT_DISCLAIMER =
  "Disclaimer: The information provided on this platform is for informational purposes only and does not constitute financial, investment, or other professional advice. You should not rely on this information to make any investment decisions. Always consult with a qualified financial advisor before making any investment decisions. We do not guarantee the accuracy, completeness, or timeliness of any information provided and shall not be held liable for any errors or omissions, or for any loss or damage incurred as a result of using this information.";

/**
 * TradingView attribution is placed statically at the footer of the page.
 *
 * https://www.tradingview.com
 * https://www.tradingview.com/policies
 */
export const TRADING_VIEW_COPYRIGHT_STYLES: Readonly<{
  parent: {
    display: string;
  };
}> = {
  parent: {
    display: "none",
  },
};

export const DEFAULT_TICKER_TAPE_TICKERS: ReadonlyArray<{
  symbol: string;
  exchangeShortName: string;
}> = [
  { symbol: "XLY", exchangeShortName: "AMEX" }, // Consumer Discretionary
  { symbol: "XLP", exchangeShortName: "AMEX" }, // Consumer Staples
  { symbol: "XLE", exchangeShortName: "AMEX" }, // Energy
  { symbol: "XLF", exchangeShortName: "AMEX" }, // Financials
  { symbol: "XLV", exchangeShortName: "AMEX" }, // Healthcare
  { symbol: "XLI", exchangeShortName: "AMEX" }, // Industrials
  { symbol: "XLB", exchangeShortName: "AMEX" }, // Materials
  { symbol: "XLRE", exchangeShortName: "AMEX" }, // Real Estate
  { symbol: "XLK", exchangeShortName: "AMEX" }, // Technology
  { symbol: "XLC", exchangeShortName: "AMEX" }, // Telecommunications
  { symbol: "XLU", exchangeShortName: "AMEX" }, // Utilities
];

export const COLOR_WHEEL_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#d0ed57",
  "#a4de6c",
  "#ffbb28",
  "#ff6361",
  "#6a8d92",
  "#b8860b",
] as const;

export const MAX_RECENTLY_VIEWED_ITEMS = 10;

export const MIN_TICKER_BUCKET_NAME_LENGTH = 3;

export const DEFAULT_COUNTRY_CODE = "US";
export const DEFAULT_CURRENCY_CODE = "USD";
export const DEFAULT_LOCALE = "en-US";

export const MQTT_SYNC_KEYS: readonly (keyof StoreStateProps)[] = [
  "tickerBuckets",
] as const;

export const INDEXED_DB_PERSISTENCE_KEYS: readonly (keyof StoreStateProps)[] = [
  "tickerBuckets",
  "subscribedMQTTRoomNames",
] as const;
