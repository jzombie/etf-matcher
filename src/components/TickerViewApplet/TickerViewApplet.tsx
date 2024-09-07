import React, { useMemo } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import WindowManager from "@components/WindowManager";

import useTickerDetail from "@hooks/useTickerDetail";

import customLogger from "@utils/customLogger";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import ETFHolderList from "./applets/ETFHolderList.applet";
import ETFHoldingList from "./applets/ETFHoldingList.applet";
import HistoricalPriceChart from "./applets/HistoricalPriceChart.applet";
import PCAScatterPlot from "./applets/PCAScatterPlot.applet";
import TickerInformation from "./applets/TickerInformation.applet";

export type TickerViewAppletProps = {
  tickerId: number;
};

// TODO: Ensure `WindowManager` gets wrapped with `TickerContainer`
export default function TickerViewApplet({ tickerId }: TickerViewAppletProps) {
  const { tickerDetail, isLoadingTickerDetail } = useTickerDetail(tickerId);

  const contentMap = useMemo(
    () => ({
      "Ticker Information":
        isLoadingTickerDetail || !tickerDetail ? (
          // TODO: Use spinner
          // TODO: Handle error condition
          <Center>Loading</Center>
        ) : (
          <TickerInformation tickerDetail={tickerDetail} />
        ),
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
      direction: "column",
      first: {
        direction: "row",
        first: "Ticker Information",
        second: {
          direction: "row",
          first: "Historical Prices",
          second: {
            direction: "row",
            first: "Similarity Search",
            second: "Sector Allocation",
            splitPercentage: 50,
          },
          splitPercentage: 55.603293949158605,
        },
        splitPercentage: 25,
      },
      second: {
        direction: "row",
        first: "ETF Holders",
        second: "ETF Holdings",
        splitPercentage: 50,
      },
      splitPercentage: 30.312061969752857,
    }),
    [],
  );

  return (
    <WindowManager
      initialValue={initialValue}
      contentMap={contentMap}
      // TODO: Handle debug
      onChange={(newLayout) => customLogger.debug({ newLayout })}
    />
  );
}
