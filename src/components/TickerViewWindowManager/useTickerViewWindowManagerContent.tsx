import React, { useEffect, useMemo, useState } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import SectorsPieChart from "@components/SectorsPieChart";

import useTickerDetail from "@hooks/useTickerDetail";

import {
  RustServiceETFAggregateDetail,
  fetchETFAggregateDetailByTickerId,
} from "@utils/callRustService";

import ETFHolderList from "./applets/ETFHolderList.applet";
import ETFHoldingList from "./applets/ETFHoldingList.applet";
import HistoricalPriceChart from "./applets/HistoricalPriceChart.applet";
import PCAScatterPlot from "./applets/PCAScatterPlot.applet";
import TickerInformation from "./applets/TickerInformation.applet";

export default function useTickerViewWindowManagerContent(tickerId: number) {
  const { tickerDetail, isLoadingTickerDetail } = useTickerDetail(tickerId);

  // Refactor: Save ETF aggregate detail
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
          second: {
            first: "Similarity Search",
            second: "ETF Holdings",
            direction: "row",
          },
          direction: "row",
          splitPercentage: 24.741115697530518,
        },
        splitPercentage: 52.089700882585255,
      },
      second: "ETF Holders",
      direction: "row",
      splitPercentage: 68.16939890710383,
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
          <TickerInformation tickerDetail={tickerDetail} />
        ),
      "ETF Holders":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHolderList tickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "ETF Holdings":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHoldingList etfTickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "Historical Prices":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <HistoricalPriceChart tickerDetail={tickerDetail} />
        ),
      "Similarity Search":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <AutoScaler>
            <PCAScatterPlot tickerDetail={tickerDetail} />
          </AutoScaler>
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
    }),
    [etfAggregateDetail, isLoadingTickerDetail, tickerDetail],
  );

  return {
    initialValue,
    contentMap,
    tickerDetail,
  };
}
