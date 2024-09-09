import React, { useCallback, useMemo, useRef, useState } from "react";

import { Box, Button, ButtonGroup } from "@mui/material";

import Layout, { Content, Header } from "@layoutKit/Layout";
import { TRADING_VIEW_COPYRIGHT_STYLES } from "@src/constants";
import { MiniChart } from "react-ts-tradingview-widgets";
import type { DateRange } from "react-ts-tradingview-widgets";

import Transition from "@components/Transition";

import { RustServiceTickerDetail } from "@utils/callRustService";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import TickerDetailAppletWrap from "../components/TickerDetailAppletWrap";

const DATE_RANGES: DateRange[] = ["1D", "1M", "3M", "12M", "60M", "ALL"];

export type HistoricalPriceChartAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  isTiling: boolean;
};

export default function HistoricalPriceChartApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  isTiling,
}: HistoricalPriceChartAppletProps) {
  const formattedSymbolWithExchange = useMemo(() => {
    if (tickerDetail) {
      return formatSymbolWithExchange(tickerDetail);
    } else {
      return "";
    }
  }, [tickerDetail]);

  const [dateRange, setDateRange] = useState<DateRange>("1M");
  const previousRangeRef = useRef<DateRange>("1M");

  const handleDateRangeChange = useCallback(
    (range: string) => {
      previousRangeRef.current = dateRange; // Store the previous range
      setDateRange(range as DateRange);
    },
    [dateRange],
  );

  const getDirection = useCallback(() => {
    const prevIndex = DATE_RANGES.indexOf(previousRangeRef.current);
    const currentIndex = DATE_RANGES.indexOf(dateRange);
    return currentIndex > prevIndex ? "left" : "right";
  }, [dateRange]);

  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      isTiling={isTiling}
    >
      <Layout>
        <Header>
          <Box sx={{ textAlign: "center" }}>
            <ButtonGroup variant="outlined" aria-label="outlined button group">
              {DATE_RANGES.map((range) => (
                <Button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  variant={dateRange === range ? "contained" : "outlined"}
                >
                  {range}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Header>
        <Content>
          <Transition trigger={dateRange} direction={getDirection()}>
            <MiniChart
              symbol={formattedSymbolWithExchange}
              colorTheme="dark"
              width="100%"
              height="100%"
              copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
              dateRange={dateRange}
            />
          </Transition>
        </Content>
      </Layout>
    </TickerDetailAppletWrap>
  );
}
