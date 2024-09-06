import React from "react";

import AutoScaler from "@layoutKit/AutoScaler";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";

import HistoricalPriceChart from "@components/TickerDetail/TickerDetail.HistoricalPriceChart";
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
      <HistoricalPriceChart
        tickerSymbol="AAPL"
        formattedSymbolWithExchange="NASDAQ:AAPL"
      />
    </AutoScaler>
  ),
  "Similarity Search": <div>Similarity Search content</div>,
};

const initialValue = {
  direction: "column",
  first: "Detail",
  second: {
    direction: "row",
    first: "Historical Prices",
    second: "Similarity Search",
  },
  splitPercentage: 40,
};

export default function SearchResults() {
  return <WindowManager initialValue={initialValue} contentMap={contentMap} />;
}
