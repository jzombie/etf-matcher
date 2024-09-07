import React from "react";

import PCAScatterPlot from "@components/PCAScatterPlot";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerSimilaritySearchAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerSimilaritySearchApplet({
  tickerDetail,
}: TickerSimilaritySearchAppletProps) {
  return <PCAScatterPlot tickerDetail={tickerDetail} />;
}
