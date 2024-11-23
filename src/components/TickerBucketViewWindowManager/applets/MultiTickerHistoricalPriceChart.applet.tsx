import React from "react";

import { Box, styled } from "@mui/material";

import AdvancedRealTimeChart from "@components/vendor/tradingview/AdvancedRealTimeChart";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

export type MultiTickerHistoricalPriceChartAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

const StyledBox = styled(Box)({
  height: 500,
});

export default function MultiTickerHistoricalPriceChartApplet({
  formattedSymbolsWithExchange,
  isTiling,
  ...rest
}: MultiTickerHistoricalPriceChartAppletProps) {
  // This is used to help set height on mobile
  const Container = isTiling ? React.Fragment : StyledBox;

  return (
    <TickerBucketViewWindowManagerAppletWrap
      isTiling={isTiling}
      formattedSymbolsWithExchange={formattedSymbolsWithExchange}
      {...rest}
    >
      {formattedSymbolsWithExchange && (
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
        <Container>
          <AdvancedRealTimeChart
            symbol={formattedSymbolsWithExchange?.[0]}
            watchlist={formattedSymbolsWithExchange}
          />
        </Container>
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
