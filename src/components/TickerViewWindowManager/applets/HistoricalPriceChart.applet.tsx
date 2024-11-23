import React, { useMemo } from "react";

import { Box, styled } from "@mui/material";

import AdvancedRealTimeChart from "@components/vendor/tradingview/AdvancedRealTimeChart";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../components/TickerViewWindowManager.AppletWrap";

const StyledBox = styled(Box)({
  height: 500,
});

export type HistoricalPriceChartAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function HistoricalPriceChartApplet({
  tickerDetail,
  isTiling,
  ...rest
}: HistoricalPriceChartAppletProps) {
  const formattedSymbolWithExchange = useMemo(() => {
    if (tickerDetail) {
      return formatSymbolWithExchange(tickerDetail);
    } else {
      return "";
    }
  }, [tickerDetail]);

  // This is used to help set height on mobile
  const Container = isTiling ? React.Fragment : StyledBox;

  return (
    <TickerViewWindowManagerAppletWrap
      tickerDetail={tickerDetail}
      isTiling={isTiling}
      {...rest}
    >
      <Container>
        <AdvancedRealTimeChart symbol={formattedSymbolWithExchange} />
      </Container>
    </TickerViewWindowManagerAppletWrap>
  );
}
