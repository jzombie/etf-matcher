export const INVESTMENT_DISCLAIMER =
  "Disclaimer: The information provided on this platform is for informational purposes only and does not constitute financial, investment, or other professional advice. You should not rely on this information to make any investment decisions. Always consult with a qualified financial advisor before making any investment decisions. We do not guarantee the accuracy, completeness, or timeliness of any information provided and shall not be held liable for any errors or omissions, or for any loss or damage incurred as a result of using this information.";

/**
 * TradingView attribution is placed statically at the footer of the page.
 *
 * https://www.tradingview.com
 * https://www.tradingview.com/policies
 */
export const TRADING_VIEW_COPYRIGHT_STYLES = {
  parent: {
    display: "none",
  },
};

// TODO: Move; don't hardcode here
//
// https://tradingview-widgets.jorrinkievit.xyz/docs/components/TickerTape#ticker-symbol
export const DEFAULT_SECTOR_SYMBOLS = [
  { proName: "XLY", title: "Consumer Discretionary (XLY)" },
  { proName: "XLP", title: "Consumer Staples (XLP)" },
  { proName: "XLE", title: "Energy (XLE)" },
  { proName: "XLF", title: "Financials (XLF)" },
  { proName: "XLV", title: "Healthcare (XLV)" },
  { proName: "XLI", title: "Industrials (XLI)" },
  { proName: "XLB", title: "Materials (XLB)" },
  { proName: "XLRE", title: "Real Estate (XLRE)" },
  { proName: "XLK", title: "Technology (XLK)" },
  { proName: "XLC", title: "Telecommunications (XLC)" },
  { proName: "XLU", title: "Utilities (XLU)" },
];
