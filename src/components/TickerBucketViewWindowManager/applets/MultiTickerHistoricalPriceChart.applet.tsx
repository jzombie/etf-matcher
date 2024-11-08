import React from "react";

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
  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <div>
        TODO: Probably use this chart to render multiple tickers:
        https://tradingview-widgets.jorrinkievit.xyz/docs/components/AdvancedRealTimeChartWidget
      </div>

      {multiTickerDetails?.map((tickerDetail) => (
        <div key={tickerDetail.ticker_id}>{tickerDetail.symbol}</div>
      ))}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
