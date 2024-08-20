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

export const COLOR_WHEEL_COLORS: Readonly<string[]> = [
  "#00FF7F", // Neon Green
  "#1E90FF", // Neon Dodger Blue
  "#FF6347", // Neon Tomato
  "#FFD700", // Neon Gold
  "#FF4500", // Neon Orange Red
  "#FF00FF", // Neon Magenta
  "#8A2BE2", // Neon Blue Violet
  "#20B2AA", // Neon Light Sea Green
  "#ADFF2F", // Neon Green Yellow
  "#7FFF00", // Neon Chartreuse
  "#9400D3", // Neon Dark Violet
  "#00BFFF", // Neon Deep Sky Blue
  "#2E8B57", // Neon Sea Green
  "#FF1493", // Neon Deep Pink
  "#4682B4", // Neon Steel Blue
  "#8B0000", // Neon Dark Red
  "#00CED1", // Neon Dark Turquoise
  "#FF8C00", // Neon Dark Orange
  "#FF69B4", // Neon Hot Pink
  "#00FFFF", // Neon Cyan
  "#40E0D0", // Neon Turquoise
  "#FF6347", // Neon Tomato
  "#32CD32", // Neon Lime Green
  "#39FF14", // Neon Green
  "#4169E1", // Neon Royal Blue
  "#FFD700", // Neon Gold
];

export const MAX_RECENTLY_VIEWED_ITEMS = 10;

export const DEFAULT_CURRENCY_CODE = "USD";

export const MQTT_SYNC_KEYS: Readonly<Set<keyof StoreStateProps>> = new Set([
  "tickerBuckets",
]);
