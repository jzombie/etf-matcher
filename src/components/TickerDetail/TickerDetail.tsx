import React, { useEffect, useMemo, useState } from "react";

import { Box, Button, CircularProgress } from "@mui/material";

import Center from "@layoutKit/Center";
import store from "@src/store";
import type { RustServiceETFAggregateDetail } from "@src/types";

import Section from "@components/Section";

import useTickerDetail from "@hooks/useTickerDetail";

import formatSymbolWithExchange from "@utils/formatSymbolWithExchange";

import TickerContainer from "../TickerContainer";
import TickerDetailBucketManager from "./TickerDetail.BucketManager";
import ETFHolderList from "./TickerDetail.ETFHolderList";
import ETFHoldingList from "./TickerDetail.ETFHoldingList";
import FinancialChartsGrid from "./TickerDetail.FinancialChartsGrid";
import FinancialReport from "./TickerDetail.FinancialReport";
import TickerDetailHeader from "./TickerDetail.Header";
import HistoricalPriceChart from "./TickerDetail.HistoricalPriceChart";

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

  // const [showNews, setShowNews] = useState(false);

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
      <TickerDetailHeader
        tickerDetail={tickerDetail}
        etfAggregateDetail={etfAggregateDetail}
        formattedSymbolWithExchange={formattedSymbolWithExchange}
      />

      <Button
        onClick={() => store.PROTO_fetchTickerVector(tickerDetail.ticker_id)}
      >
        PROTO::fetchTickerVector()
      </Button>

      <Button
        onClick={() => store.PROTO_fetchClosestTickers(tickerDetail.ticker_id)}
      >
        PROTO::fetchClosestTickerIds
      </Button>

      <HistoricalPriceChart
        tickerSymbol={tickerDetail.symbol}
        formattedSymbolWithExchange={formattedSymbolWithExchange}
      />

      <Box sx={{ textAlign: "center" }}>
        {/* <Button onClick={() => setShowNews(!showNews)} startIcon={<NewsIcon />}>
          {showNews ? "Hide News" : "View News"}
        </Button> */}
        <TickerDetailBucketManager tickerDetail={tickerDetail} />
      </Box>

      <Section>
        <FinancialChartsGrid tickerDetail={tickerDetail} />
      </Section>

      {/* {showNews && (
        // TODO: This seems out of date for `CRWD`, regardless if using `formattedSymbolWithExchange`
        // or just the `tickerSymbol` itself. Other symbols seem to be okay.
        <Timeline
          feedMode="symbol"
          colorTheme="dark"
          symbol={formattedSymbolWithExchange}
          width="100%"
          copyrightStyles={TRADING_VIEW_COPYRIGHT_STYLES}
        />
      )} */}

      <FinancialReport
        tickerId={tickerDetail.ticker_id}
        isETF={tickerDetail.is_etf}
      />

      {tickerDetail?.is_etf && (
        <ETFHoldingList etfTickerDetail={tickerDetail} />
      )}

      {tickerDetail?.is_held_in_etf && (
        <ETFHolderList tickerDetail={tickerDetail} />
      )}
    </TickerContainer>
  );
}
