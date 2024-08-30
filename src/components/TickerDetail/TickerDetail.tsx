import React, { useEffect, useMemo, useState } from "react";

import { Box, CircularProgress, Grid } from "@mui/material";

import Center from "@layoutKit/Center";
import store from "@src/store";
import type { RustServiceETFAggregateDetail } from "@src/types";

import LazyRender from "@components/LazyRender";
import TickerVectorTable from "@components/VectorQueryTable";

import useTickerDetail from "@hooks/useTickerDetail";

import formatSymbolWithExchange from "@utils/formatSymbolWithExchange";

import TickerContainer from "../TickerContainer";
import TickerDetailBucketManager from "./TickerDetail.BucketManager";
import ETFHolderList from "./TickerDetail.ETFHolderList";
import ETFHoldingList from "./TickerDetail.ETFHoldingList";
import FinancialChartsGrid from "./TickerDetail.FinancialChartsGrid";
import TickerDetailHeader from "./TickerDetail.Header";
import HistoricalPriceChart from "./TickerDetail.HistoricalPriceChart";
import PCAScatterPlot from "./TickerDetail.PCAScatterPlot";

export type TickerDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
  onLoad?: () => void;
  preventLoadingSpinner?: boolean;
};

export default function TickerDetail({
  tickerId,
  onIntersectionStateChange,
  onLoad,
  preventLoadingSpinner = false,
  ...rest
}: TickerDetailProps) {
  const { isLoadingTickerDetail, tickerDetail } = useTickerDetail(
    tickerId,
    onLoad,
  );

  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  useEffect(() => {
    if (tickerDetail?.is_etf) {
      store
        .fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id)
        .then(setETFAggregateDetail);
    }
  }, [tickerDetail]);

  const formattedSymbolWithExchange = useMemo(
    () => tickerDetail && formatSymbolWithExchange(tickerDetail),
    [tickerDetail],
  );

  if (isLoadingTickerDetail && !preventLoadingSpinner) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (!formattedSymbolWithExchange || !tickerDetail) {
    return null;
  }

  return (
    <TickerContainer
      style={{ marginBottom: 12 }}
      tickerId={tickerDetail.ticker_id}
      onIntersectionStateChange={onIntersectionStateChange}
      {...rest}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TickerDetailHeader
            tickerDetail={tickerDetail}
            etfAggregateDetail={etfAggregateDetail}
            formattedSymbolWithExchange={formattedSymbolWithExchange}
          />
        </Grid>
        <Grid item xs={12} md={6} mb={1}>
          <LazyRender>
            <PCAScatterPlot tickerDetail={tickerDetail} />
          </LazyRender>
        </Grid>
      </Grid>

      <LazyRender>
        <HistoricalPriceChart
          tickerSymbol={tickerDetail.symbol}
          formattedSymbolWithExchange={formattedSymbolWithExchange}
        />

        <Box sx={{ textAlign: "center" }}>
          <TickerDetailBucketManager tickerDetail={tickerDetail} />
        </Box>

        <TickerVectorTable tickerDetail={tickerDetail} />

        <FinancialChartsGrid tickerDetail={tickerDetail} />

        {tickerDetail?.is_etf && (
          <ETFHoldingList etfTickerDetail={tickerDetail} />
        )}

        {tickerDetail?.is_held_in_etf && (
          <ETFHolderList tickerDetail={tickerDetail} />
        )}
      </LazyRender>
    </TickerContainer>
  );
}
