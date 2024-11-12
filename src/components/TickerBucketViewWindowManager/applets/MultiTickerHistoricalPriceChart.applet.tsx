import React from "react";

import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

export type MultiTickerHistoricalPriceChartAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerHistoricalPriceChartApplet({
  formattedSymbolsWithExchange,
  ...rest
}: MultiTickerHistoricalPriceChartAppletProps) {
  return (
    <TickerBucketViewWindowManagerAppletWrap
      formattedSymbolsWithExchange={formattedSymbolsWithExchange}
      {...rest}
    >
      {
        // FIXME: Callbacks are not supported in TradingView charts without using
        // their charting library directly:
        // https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/
        //
        // This will require setting ETF Matcher to establish its own data feed directly.
        //
        // Additional references:
        // - Advanced Chart Documentation: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
        // - React TS TradingView Widgets: https://github.com/JorrinKievit/react-ts-tradingview-widgets
        //
        // TODO: Consider adding an overlay which appears on the first usage,
        // explaining how this chart doesn't update the app's state, in a fashion
        // that is easy to comprehend.
      }
      {formattedSymbolsWithExchange && (
        <AdvancedRealTimeChart
          symbol={formattedSymbolsWithExchange?.[0]}
          watchlist={formattedSymbolsWithExchange}
          allow_symbol_change={false}
          theme={TRADING_VIEW_THEME}
          autosize
          copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
        />
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
