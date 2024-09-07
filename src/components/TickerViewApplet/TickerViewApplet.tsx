import React, { useMemo } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import WindowManager from "@components/WindowManager";

import useTickerDetail from "@hooks/useTickerDetail";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import ETFHolderList from "./applets/ETFHolderList.applet";
import ETFHoldingList from "./applets/ETFHoldingList.applet";
import HistoricalPriceChart from "./applets/HistoricalPriceChart.applet";
import PCAScatterPlot from "./applets/PCAScatterPlot.applet";

export type TickerViewAppletProps = {
  tickerId: number;
};

// TODO: Ensure `WindowManager` gets wrapped with `TickerContainer`
export default function TickerViewApplet({ tickerId }: TickerViewAppletProps) {
  const { tickerDetail, isLoadingTickerDetail } = useTickerDetail(tickerId);

  const contentMap = useMemo(
    () => ({
      "ETF Holders":
        isLoadingTickerDetail || !tickerDetail ? (
          // TODO: Use spinner
          // TODO: Handle error condition
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHolderList tickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "ETF Holdings":
        isLoadingTickerDetail || !tickerDetail ? (
          // TODO: Use spinner
          // TODO: Handle error condition
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHoldingList etfTickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "Historical Prices":
        isLoadingTickerDetail || !tickerDetail ? (
          // TODO: Use spinner
          // TODO: Handle error condition
          <Center>Loading</Center>
        ) : (
          <AutoScaler>
            <HistoricalPriceChart
              tickerSymbol={tickerDetail?.symbol}
              formattedSymbolWithExchange={formatSymbolWithExchange(
                tickerDetail,
              )}
            />
          </AutoScaler>
        ),
      "Similarity Search":
        isLoadingTickerDetail || !tickerDetail ? (
          // TODO: Use spinner
          // TODO: Handle error condition
          <Center>Loading</Center>
        ) : (
          <PCAScatterPlot tickerDetail={tickerDetail} />
        ),
    }),
    [isLoadingTickerDetail, tickerDetail],
  );

  // Use 'row' and 'column' instead of generic strings
  const initialValue: MosaicNode<string> = useMemo(
    () => ({
      direction: "column", // Main direction is 'column' to stack rows vertically
      first: {
        direction: "row", // Top row with 3 columns
        first: "Historical Prices", // First column
        second: {
          direction: "row", // Nested row for the second and third columns
          first: "Similarity Search", // Second column
          second: "Sector Allocation", // Third column
          splitPercentage: 50, // Split equally between Similarity Search and Sector Allocation
        },
        splitPercentage: 33.33, // Split for the first column to take 33.33% of the width
      },
      second: {
        direction: "row", // Bottom row with 2 columns
        first: "ETF Holders", // First column in bottom row
        second: "ETF Holdings", // Second column in bottom row
        splitPercentage: 50, // Split the bottom row evenly
      },
      splitPercentage: 60, // Top row takes 60% of the height, bottom row 40%
    }),
    [],
  );

  return <WindowManager initialValue={initialValue} contentMap={contentMap} />;
}
