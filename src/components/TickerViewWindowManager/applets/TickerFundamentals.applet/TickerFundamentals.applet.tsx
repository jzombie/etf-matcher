import React from "react";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerFundamentalsAppletProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerFundamentalsApplet({
  tickerDetail,
}: TickerFundamentalsAppletProps) {
  return <div>[Ticker Fundamentals]</div>;
}
