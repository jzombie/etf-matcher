import React, { useMemo } from "react";

import type { TickerBucket } from "@src/store";
import { MosaicNode } from "react-mosaic-component";

import useMultiETFAggregateDetail from "@hooks/useMultiETFAggregateDetail";
import useMultiTickerDetail from "@hooks/useMultiTickerDetail";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import MultiTickerHistoricalPriceChartApplet from "../applets/MultiTickerHistoricalPriceChart.applet";
import MultiTickerManagerApplet from "../applets/MultiTickerManager.applet";
import type { TickerBucketViewWindowManagerAppletWrapProps } from "../components/TickerBucketViewWindowManager.AppletWrap";

export default function useTickerBucketViewWindowManagerContent(
  tickerBucket: TickerBucket,
  isTiling: boolean,
) {
  const tickerIds = useMemo(
    () => tickerBucket.tickers.map((ticker) => ticker.tickerId),
    [tickerBucket],
  );
  const {
    isLoading: isLoadingMultiTickerDetails,
    multiTickerDetails,
    error: multiTickerDetailsError,
  } = useMultiTickerDetail(tickerIds);

  const etfTickerIds = useMemo(
    () =>
      multiTickerDetails
        ?.filter((ticker) => ticker.is_etf)
        .map((ticker) => ticker.ticker_id) || [],
    [multiTickerDetails],
  );

  const {
    isLoading: isLoadingMultiETFAggregateDetails,
    multiETFAggregateDetails,
    error: multiETFAggregateDetailsError,
  } = useMultiETFAggregateDetail(etfTickerIds);

  const formattedSymbolsWithExchange = useMemo(
    () =>
      multiTickerDetails?.map((tickerDetail) =>
        formatSymbolWithExchange(tickerDetail),
      ),
    [multiTickerDetails],
  );

  const commonProps: Omit<
    TickerBucketViewWindowManagerAppletWrapProps,
    "children"
  > = useMemo(
    () => ({
      multiTickerDetails,
      formattedSymbolsWithExchange,
      isLoadingMultiTickerDetails,
      multiTickerDetailsError,
      multiETFAggregateDetails,
      isLoadingMultiETFAggregateDetails,
      multiETFAggregateDetailsError,
      isTiling,
    }),
    [
      multiTickerDetails,
      formattedSymbolsWithExchange,
      isLoadingMultiTickerDetails,
      multiTickerDetailsError,
      multiETFAggregateDetails,
      isLoadingMultiETFAggregateDetails,
      multiETFAggregateDetailsError,
      isTiling,
    ],
  );

  // TODO: Redefine as necessary
  const initialLayout: MosaicNode<string> = useMemo(
    () => ({
      first: {
        direction: "row",
        first: "Historical Prices",
        second: {
          first: "Fundamentals",
          second: "Similarity Search",
          direction: "column",
          splitPercentage: 52,
        },
        splitPercentage: 75,
      },
      second: {
        first: "Ticker Manager",
        second: "Sector Allocation",
        direction: "row",
      },
      direction: "column",
      splitPercentage: 80,
    }),
    [],
  );

  // TODO: Redefine as necessary
  const contentMap = useMemo(
    () => ({
      "Ticker Manager": <MultiTickerManagerApplet {...commonProps} />,
      "Historical Prices": (
        <MultiTickerHistoricalPriceChartApplet {...commonProps} />
      ),
      "Sector Allocation": <div>Render combined weighted allocations</div>,
      "Similarity Search": (
        <div>
          TODO: Use this opportunity to render PCA scatter plot of the entire
          bucket
        </div>
      ),
      Fundamentals: <div>TODO: Render combined fundamentals</div>,
    }),
    [commonProps],
  );

  return {
    initialLayout,
    contentMap,
  };
}
