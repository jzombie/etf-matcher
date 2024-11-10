import React, { useMemo } from "react";

import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange/formatSymbolWithExchange";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

export type MultiTickerHistoricalPriceChartAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerHistoricalPriceChartApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerHistoricalPriceChartAppletProps) {
  const formattedSymbolsWithExchange = useMemo(
    () =>
      multiTickerDetails?.map((tickerDetail) =>
        formatSymbolWithExchange(tickerDetail),
      ),
    [multiTickerDetails],
  );

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
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
      }
      <AdvancedRealTimeChart
        symbol={formattedSymbolsWithExchange?.[0]}
        watchlist={formattedSymbolsWithExchange}
        allow_symbol_change={false}
        theme={TRADING_VIEW_THEME}
        autosize
        copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
      />
      {/* <div>
        TODO: Probably use this chart to render multiple tickers:
        https://tradingview-widgets.jorrinkievit.xyz/docs/components/AdvancedRealTimeChartWidget
      </div>

      {multiTickerDetails?.map((tickerDetail) => (
        <div key={tickerDetail.ticker_id}>{tickerDetail.symbol}</div>
      ))} */}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
