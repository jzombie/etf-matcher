import React from "react";

import { RustServiceTickerDetail } from "@utils/callRustService";

import FinancialChartsGrid from "./FinancialChartsGrid";

export type TickerFundamentalsAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerFundamentalsApplet({
  tickerDetail,
}: TickerFundamentalsAppletProps) {
  return <FinancialChartsGrid tickerDetail={tickerDetail} />;
}
