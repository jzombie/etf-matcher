import React, { useMemo } from "react";

import { MosaicNode } from "react-mosaic-component";

import useETFAggregateDetail from "@hooks/useETFAggregateDetail";
import useTickerDetail from "@hooks/useTickerDetail";

import ETFHoldersAndHoldingsApplet from "./applets/ETFHoldersAndHoldings.applet";
import HistoricalPriceChartApplet from "./applets/HistoricalPriceChart.applet";
import SectorAllocationApplet from "./applets/SectorAllocation.applet";
import TickerFundamentalsApplet from "./applets/TickerFundamentals.applet";
import TickerInformationApplet from "./applets/TickerInformation.applet";
import TickerSimilaritySearchApplet from "./applets/TickerSimilaritySearch.applet";

export default function useTickerViewWindowManagerContent(
  tickerId: number,
  isTiling: boolean,
) {
  const { tickerDetail, isLoadingTickerDetail, tickerDetailError } =
    useTickerDetail(tickerId);

  const isETF = Boolean(tickerDetail && tickerDetail.is_etf);

  const {
    etfAggregateDetail,
    isLoadingETFAggregateDetail,
    etfAggregateDetailError,
  } = useETFAggregateDetail({
    tickerId,
    shouldLoad: isETF,
  });

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
      "Ticker Information": (
        <TickerInformationApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          etfAggregateDetail={etfAggregateDetail}
          isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
          etfAggregateDetailError={etfAggregateDetailError}
          isTiling={isTiling}
        />
      ),
      "Historical Prices": (
        <HistoricalPriceChartApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          isTiling={isTiling}
        />
      ),
      "Sector Allocation": (
        <SectorAllocationApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          etfAggregateDetail={etfAggregateDetail}
          isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
          etfAggregateDetailError={etfAggregateDetailError}
          isTiling={isTiling}
        />
      ),
      "Similarity Search": (
        <TickerSimilaritySearchApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          isTiling={isTiling}
        />
      ),

      Fundamentals: (
        <TickerFundamentalsApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          isTiling={isTiling}
        />
      ),
      "ETF Holders and Holdings": (
        <ETFHoldersAndHoldingsApplet
          tickerDetail={tickerDetail}
          isLoadingTickerDetail={isLoadingTickerDetail}
          tickerDetailError={tickerDetailError}
          isTiling={isTiling}
        />
      ),
    }),
    [
      etfAggregateDetail,
      etfAggregateDetailError,
      isLoadingETFAggregateDetail,
      isLoadingTickerDetail,
      isTiling,
      tickerDetail,
      tickerDetailError,
    ],
  );

  return {
    initialValue,
    contentMap,
    tickerDetail,
  };
}
