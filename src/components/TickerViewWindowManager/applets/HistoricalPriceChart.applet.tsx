import React, { useMemo } from "react";

import { Box, styled } from "@mui/material";

import {
  TRADING_VIEW_COPYRIGHT_STYLES,
  TRADING_VIEW_THEME,
} from "@src/constants";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

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
        <AdvancedRealTimeChart
          symbol={formattedSymbolWithExchange}
          allow_symbol_change={false}
          theme={TRADING_VIEW_THEME}
          autosize
          hotlist
          copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
        />
      </Container>
    </TickerViewWindowManagerAppletWrap>
  );
}
