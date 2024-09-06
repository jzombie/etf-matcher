import React, { useEffect, useMemo, useState } from "react";

import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";

import Center from "@layoutKit/Center";

import LazyRender from "@components/LazyRender";
import SectorsPieChart from "@components/SectorsPieChart";
import TickerVectorTable from "@components/TickerVectorQueryTable";

import useTickerDetail from "@hooks/useTickerDetail";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import { fetchETFAggregateDetailByTickerId } from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

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
      fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id).then(
        setETFAggregateDetail,
      );
    }
  }, [tickerDetail]);

  useEffect(() => {
    if (etfAggregateDetail) {
      customLogger.debug({ etfAggregateDetail });
    }
  }, [etfAggregateDetail]);

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
      {/* Header Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TickerDetailHeader
            tickerDetail={tickerDetail}
            etfAggregateDetail={etfAggregateDetail}
            formattedSymbolWithExchange={formattedSymbolWithExchange}
          />
        </Grid>

        {/* Optional Second Section (Add any other overview info here if needed) */}
        <Grid item xs={12} md={6}>
          {/* Placeholder for additional summary information */}
          {/* You can add a Paper or other components here */}
        </Grid>
      </Grid>

      {/* Historical Price Chart - Full Width */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={12}>
          <HistoricalPriceChart
            tickerSymbol={tickerDetail.symbol}
            formattedSymbolWithExchange={formattedSymbolWithExchange}
          />
        </Grid>
      </Grid>
      {/* Bucket Manager */}
      <Box sx={{ textAlign: "center", margin: "20px 0" }}>
        <TickerDetailBucketManager tickerDetail={tickerDetail} />
      </Box>

      {/* Grid for Side-by-Side or Centered Chart */}
      <Grid
        container
        spacing={2}
        mt={2}
        justifyContent={
          etfAggregateDetail?.major_sector_distribution
            ? "flex-start"
            : "center"
        }
      >
        <Grid
          item
          xs={12}
          md={etfAggregateDetail?.major_sector_distribution ? 6 : 12}
        >
          <LazyRender>
            <PCAScatterPlot tickerDetail={tickerDetail} />
          </LazyRender>
        </Grid>

        {etfAggregateDetail?.major_sector_distribution && (
          <Grid item xs={12} md={6}>
            <SectorsPieChart
              majorSectorDistribution={
                etfAggregateDetail?.major_sector_distribution
              }
            />
          </Grid>
        )}
      </Grid>

      {/* Split into two equal columns for data and charts */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={12} md={6}>
          <TickerVectorTable queryMode={"ticker-detail"} query={tickerDetail} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FinancialChartsGrid tickerDetail={tickerDetail} />
        </Grid>

        {tickerDetail?.is_etf && (
          <Grid item xs={12} md={6}>
            <ETFHoldingList etfTickerDetail={tickerDetail} />
          </Grid>
        )}

        {tickerDetail?.is_held_in_etf && (
          <Grid item xs={12} md={6}>
            <ETFHolderList tickerDetail={tickerDetail} />
          </Grid>
        )}
      </Grid>
    </TickerContainer>
  );
}
