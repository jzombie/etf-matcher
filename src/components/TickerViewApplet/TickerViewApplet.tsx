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
      "Similarity Search": <Center>Similarity Search content</Center>,
    }),
    [isLoadingTickerDetail, tickerDetail],
  );

  // Use 'row' and 'column' instead of generic strings
  const initialValue: MosaicNode<string> = useMemo(
    () => ({
      direction: "column", // Main direction is 'column' to stack rows vertically
      first: {
        direction: "row", // First row will have two cells side by side
        first: "Historical Prices", // First cell in the first row
        second: "Similarity Search", // Second cell in the first row
      },
      second: {
        direction: "row", // Second row will also have two cells side by side
        first: "ETF Holders", // First cell in the second row
        second: "ETF Holdings", // Second cell in the second row
      },
      splitPercentage: 50, // Adjust the split percentage between the two rows
    }),
    [],
  );

  return <WindowManager initialValue={initialValue} contentMap={contentMap} />;
}
