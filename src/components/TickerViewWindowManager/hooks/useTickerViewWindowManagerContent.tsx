import React, { useMemo } from "react";

import { MosaicNode } from "react-mosaic-component";

import useETFAggregateDetail from "@hooks/useETFAggregateDetail";
import useTickerDetail from "@hooks/useTickerDetail";

import ETFHoldersAndHoldingsApplet from "../applets/ETFHoldersAndHoldings.applet";
import HistoricalPriceChartApplet from "../applets/HistoricalPriceChart.applet";
import SectorAllocationApplet from "../applets/SectorAllocation.applet";
import TickerFundamentalsApplet from "../applets/TickerFundamentals.applet";
import TickerInformationApplet from "../applets/TickerInformation.applet";
import TickerSimilaritySearchApplet from "../applets/TickerSimilaritySearch.applet";
import type { TickerViewWindowManagerAppletWrapProps } from "../components/TickerViewWindowManager.AppletWrap";

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

  // Common props for all applets
  const commonProps: Omit<TickerViewWindowManagerAppletWrapProps, "children"> =
    useMemo(
      () => ({
        tickerDetail,
        isLoadingTickerDetail,
        tickerDetailError,
        etfAggregateDetail,
        isLoadingETFAggregateDetail,
        etfAggregateDetailError,
        isTiling,
      }),
      [
        tickerDetail,
        isLoadingTickerDetail,
        tickerDetailError,
        etfAggregateDetail,
        isLoadingETFAggregateDetail,
        etfAggregateDetailError,
        isTiling,
      ],
    );

  // Initial layout definition
  const initialLayout: MosaicNode<string> = useMemo(
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
      "Ticker Information": <TickerInformationApplet {...commonProps} />,
      "Historical Prices": <HistoricalPriceChartApplet {...commonProps} />,
      "Sector Allocation": <SectorAllocationApplet {...commonProps} />,
      "Similarity Search": <TickerSimilaritySearchApplet {...commonProps} />,

      Fundamentals: <TickerFundamentalsApplet {...commonProps} />,
      "ETF Holders and Holdings": (
        <ETFHoldersAndHoldingsApplet {...commonProps} />
      ),
    }),
    [commonProps],
  );

  return {
    initialLayout,
    contentMap,
    tickerDetail,
  };
}