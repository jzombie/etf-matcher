import React, { useMemo } from "react";

import type { TickerBucket } from "@src/store";
import { MosaicNode } from "react-mosaic-component";

import useMultiETFAggregateDetail from "@hooks/useMultiETFAggregateDetail";
import useMultiTickerDetail from "@hooks/useMultiTickerDetail";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import MultiTickerFundamentalsApplet from "../applets/MultiTickerFundamentals.applet";
import MultiTickerHistoricalPriceChartApplet from "../applets/MultiTickerHistoricalPriceChart.applet";
import MultiTickerManagerApplet from "../applets/MultiTickerManager.applet";
import MultiTickerSimilaritySearchApplet from "../applets/MultiTickerSimilaritySearch.applet";
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

  // FIXME: The layout will be reset to `initialLayout` if these dependencies
  // change. This may require some modification.
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

  const initialLayout: MosaicNode<string> = useMemo(
    () => ({
      direction: "row",
      first: {
        first: {
          first: "Historical Prices",
          second: "Similarity Search",
          direction: "row",
          splitPercentage: 64,
        },
        second: {
          first: "Sector Allocation",
          second: "Ticker Manager",
          direction: "row",
          splitPercentage: 50,
        },
        direction: "column",
        splitPercentage: 80,
      },
      second: "Fundamentals",
      splitPercentage: 75,
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
