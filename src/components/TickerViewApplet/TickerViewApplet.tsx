import React from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import { MosaicNode } from "react-mosaic-component";

// import HistoricalPriceChart from "@components/TickerDetail/TickerDetail.HistoricalPriceChart";
import WindowManager from "@components/WindowManager";

const contentMap = {
  Detail: (
    <Layout>
      <Header>Detail Header</Header>
      <Content>Detail content</Content>
      <Footer>Detail Footer</Footer>
    </Layout>
  ),
  "Historical Prices": (
    <AutoScaler>
      {/* <HistoricalPriceChart
        tickerSymbol="AAPL"
        formattedSymbolWithExchange="NASDAQ:AAPL"
      /> */}
      [HistoricalPriceChart]
    </AutoScaler>
  ),
  "Similarity Search": <Center>Similarity Search content</Center>,
};

// Use 'row' and 'column' instead of generic strings
const initialValue: MosaicNode<string> = {
  direction: "column", // Use 'column'
  first: "Detail",
  second: {
    direction: "row", // Use 'row'
    first: "Historical Prices",
    second: "Similarity Search",
  },
  splitPercentage: 40,
};

export type TickerViewAppletProps = {
  tickerId: number;
};

export default function TickerViewApplet({ tickerId }: TickerViewAppletProps) {
  // TODO: Ensure `WindowManager` gets wrapped with `TickerContainer`
  return <WindowManager initialValue={initialValue} contentMap={contentMap} />;
}
