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
