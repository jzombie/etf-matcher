import type { StoreStateProps } from "@src/store";

export const PROJECT_URL = "https://etfmatcher.com";
export const PROJECT_NAME = "ETF Matcher";
export const PROJECT_DEFAULT_TITLE = `${PROJECT_NAME}: Find ETFs Aligned with Your Investment Goals`;
export const PROJECT_DESCRIPTION =
  "Customize a virtual portfolio to find ETFs matching your strategy using machine learning analysis of financial disclosures.";
export const PROJECT_GITHUB_REPOSITORY =
  "https://github.com/jzombie/etf-matcher/";
export const PROJECT_AUTHOR_NAME = "Jeremy Harris";
export const PROJECT_AUTHOR_TYPE: "Person" | "Organization" = "Person";
export const PROJECT_AUTHOR = `${PROJECT_AUTHOR_NAME}, GitHub: ${PROJECT_GITHUB_REPOSITORY}/`;
export const PROJECT_AUTHOR_LINKEDIN_URL =
  "https://www.linkedin.com/in/jeremyharrisconsultant/";
export const PROJECT_AUTHOR_EMAIL = "info@zenosmosis.com";

export const INVESTMENT_DISCLAIMER = `
Disclaimer: The information provided on this platform pertains exclusively to 
U.S. equities markets and is for informational purposes only. It does not 
constitute financial, investment, or other professional advice. You should not 
rely on this information to make any investment decisions. Always consult with 
a qualified financial advisor before making any investment decisions. We do not 
guarantee the accuracy, completeness, or timeliness of any information provided 
and shall not be held liable for any errors or omissions, or for any loss or 
damage incurred as a result of using this information.
`;

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

export const TRADING_VIEW_THEME = "dark";

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
  "#8884d8", // Light purple
  "#82ca9d", // Soft green
  "#ffc658", // Soft yellow
  "#ff8042", // Orange
  "#8dd1e1", // Light blue
  "#d0ed57", // Lighter green
  "#a4de6c", // Greenish-yellow
  "#ffbb28", // Bright yellow
  "#ff6361", // Red
  "#6a8d92", // Teal blue
  "#b8860b", // Brownish-yellow
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
  // TODO: Enable this once for sure this won't lead to a crash if the selected
  // config is deleted
  // "preferredTickerVectorConfigKey",
] as const;

// TODO: Remove; This should come from the model config description
export const SIMILARITY_MATCHES_NOTICE = `
  Note: Similarity matches are based on 20 years
  of financial data from 10-Q statements. For
  ETFs, we use weighted averages of these
  statements. The data is analyzed and compared
  using machine learning and linear algebra
  techniques to help you find the most similar
  investments.
  `;

interface FileAcceptType {
  extensions: string[]; // List of file extensions
  mimeTypes: string[]; // List of MIME types
}

export const FILE_IMPORT_ACCEPT_MAP: ReadonlyMap<string, FileAcceptType> =
  new Map([["csv", { extensions: [".csv"], mimeTypes: ["text/csv"] }]]);

export const MAX_CSV_IMPORT_SIZE: number = 1024 * 1024 * 2;

export const DEFAULT_TICKER_VECTOR_CONFIG_KEY = "default";
