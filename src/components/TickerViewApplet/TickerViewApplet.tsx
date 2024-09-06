import React, { useMemo } from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import WindowManager from "@components/WindowManager";

import useTickerDetail from "@hooks/useTickerDetail";

import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import ETFHolderList from "./applets/ETFHolderList.applet";
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
      direction: "column", // Use 'column'
      first: "ETF Holders",
      second: {
        direction: "row", // Use 'row'
        first: "Historical Prices",
        second: "Similarity Search",
      },
      splitPercentage: 40,
    }),
    [],
  );

  return <WindowManager initialValue={initialValue} contentMap={contentMap} />;
}
