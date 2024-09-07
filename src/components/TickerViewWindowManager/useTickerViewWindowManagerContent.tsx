import React, { useEffect, useMemo, useState } from "react";

import Center from "@layoutKit/Center";
import { MosaicNode } from "react-mosaic-component";

import SectorsPieChart from "@components/SectorsPieChart";

import useTickerDetail from "@hooks/useTickerDetail";

import {
  RustServiceETFAggregateDetail,
  fetchETFAggregateDetail,
} from "@utils/callRustService";

import ETFHoldersAndHoldingsApplet from "./applets/ETFHoldersAndHoldings.applet";
import HistoricalPriceChartApplet from "./applets/HistoricalPriceChart.applet";
import TickerFundamentalsApplet from "./applets/TickerFundamentals.applet";
import TickerInformationApplet from "./applets/TickerInformation.applet";
import TickerSimilaritySearchApplet from "./applets/TickerSimilaritySearch.applet";

export default function useTickerViewWindowManagerContent(tickerId: number) {
  const { tickerDetail, isLoadingTickerDetail } = useTickerDetail(tickerId);

  // TODO: Refactor into `useETFAggregateDetail` (see `useTicker10KDetail` for prelim usage)
  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);
  useEffect(() => {
    if (tickerDetail?.is_etf) {
      fetchETFAggregateDetail(tickerDetail.ticker_id).then(
        setETFAggregateDetail,
      );
    }
  }, [tickerDetail]);

  // Initial layout definition
  const initialValue: MosaicNode<string> = useMemo(
    () => ({
      first: {
        direction: "column",
        first: {
          direction: "row",
          first: "Ticker Information",
          second: "Historical Prices",
          splitPercentage: 39.361702127659576,
        },
        second: {
          first: "Sector Allocation",
          second: "Similarity Search",
          direction: "row",
          splitPercentage: 40.13679097684473,
        },
        splitPercentage: 52.089700882585255,
      },
      second: {
        first: "ETF Holders and Holdings",
        second: "Fundamentals",
        direction: "column",
        splitPercentage: 51.89061500352696,
      },
      direction: "row",
      splitPercentage: 60.4332129963899,
    }),
    [],
  );

  // Map content to window titles
  const contentMap = useMemo(
    () => ({
      "Ticker Information":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <TickerInformationApplet tickerDetail={tickerDetail} />
        ),
      // "ETF Holders":
      //   isLoadingTickerDetail || !tickerDetail ? (
      //     <Center>Loading</Center>
      //   ) : (
      //     <Scrollable>
      //       <ETFHolderList tickerDetail={tickerDetail} />
      //     </Scrollable>
      //   ),
      "ETF Holders and Holdings":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <ETFHoldersAndHoldingsApplet tickerDetail={tickerDetail} />
        ),
      "Historical Prices":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <HistoricalPriceChartApplet tickerDetail={tickerDetail} />
        ),
      "Similarity Search":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <TickerSimilaritySearchApplet tickerDetail={tickerDetail} />
        ),
      "Sector Allocation":
        isLoadingTickerDetail || !etfAggregateDetail ? (
          <Center>Loading</Center>
        ) : (
          etfAggregateDetail?.major_sector_distribution && (
            <SectorsPieChart
              majorSectorDistribution={
                etfAggregateDetail.major_sector_distribution
              }
            />
          )
        ),
      Fundamentals:
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <TickerFundamentalsApplet tickerDetail={tickerDetail} />
        ),
    }),
    [etfAggregateDetail, isLoadingTickerDetail, tickerDetail],
  );

  return {
    initialValue,
    contentMap,
    tickerDetail,
  };
}
