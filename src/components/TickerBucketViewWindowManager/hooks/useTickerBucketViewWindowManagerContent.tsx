import React, { useMemo } from "react";

import type { TickerBucket } from "@src/store";
import { MosaicNode } from "react-mosaic-component";

import MultiTickerFundamentalsApplet from "../applets/MultiTickerFundamentals.applet";
import MultiTickerHistoricalPriceChartApplet from "../applets/MultiTickerHistoricalPriceChart.applet";
import MultiTickerManagerApplet from "../applets/MultiTickerManager.applet";
import MultiTickerSectorAllocationApplet from "../applets/MultiTickerSectorAllocation.applet";
import MultiTickerSimilaritySearchApplet from "../applets/MultiTickerSimilaritySearch.applet";
import type { TickerBucketViewWindowManagerAppletWrapProps } from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "./useTickerSelectionManagerContext";

export default function useTickerBucketViewWindowManagerContent(
  tickerBucket: TickerBucket,
  isTiling: boolean,
) {
  const tickerBucketType = useMemo(() => tickerBucket.type, [tickerBucket]);

  const {
    isLoadingAdjustedTickerDetails,
    adjustedTickerDetails,
    adjustedTickerDetailsError,
    isLoadingAdjustedETFAggregateDetails,
    adjustedETFAggregateDetails,
    adjustedETFAggregateDetailsError,
    formattedAdjustedSymbolsWithExchange,
  } = useTickerSelectionManagerContext();

  const commonProps: Omit<
    TickerBucketViewWindowManagerAppletWrapProps,
    "children"
  > = useMemo(
    () => ({
      tickerBucketType,
      isLoadingAdjustedTickerDetails,
      adjustedTickerDetails,
      adjustedTickerDetailsError,
      isLoadingAdjustedETFAggregateDetails,
      adjustedETFAggregateDetails,
      adjustedETFAggregateDetailsError,
      formattedAdjustedSymbolsWithExchange,
      isTiling,
    }),
    [
      tickerBucketType,
      isLoadingAdjustedTickerDetails,
      adjustedTickerDetails,
      adjustedTickerDetailsError,
      isLoadingAdjustedETFAggregateDetails,
      adjustedETFAggregateDetails,
      adjustedETFAggregateDetailsError,
      formattedAdjustedSymbolsWithExchange,
      isTiling,
    ],
  );

  const initialLayout: MosaicNode<string> = useMemo(
    () => ({
      direction: "row",
      first: {
        first: {
          first: "Historical Prices",
          second: "Sector Allocation",
          direction: "row",
          splitPercentage: 72.86409915891987,
        },
        second: {
          first: "Similarity Search",
          second: "Ticker Manager",
          direction: "row",
          splitPercentage: 50,
        },
        direction: "column",
        splitPercentage: 45.05169214456128,
      },
      second: "Fundamentals",
      splitPercentage: 75,
    }),
    [],
  );

  const contentMap = useMemo(
    () => ({
      "Ticker Manager": <MultiTickerManagerApplet {...commonProps} />,
      "Historical Prices": (
        <MultiTickerHistoricalPriceChartApplet {...commonProps} />
      ),
      "Sector Allocation": (
        <MultiTickerSectorAllocationApplet {...commonProps} />
      ),
      "Similarity Search": (
        <MultiTickerSimilaritySearchApplet {...commonProps} />
      ),
      Fundamentals: <MultiTickerFundamentalsApplet {...commonProps} />,
    }),
    [commonProps],
  );

  return {
    initialLayout,
    contentMap,
  };
}
