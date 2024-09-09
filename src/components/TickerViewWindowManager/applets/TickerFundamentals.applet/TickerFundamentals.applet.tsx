import React from "react";

import { RustServiceTickerDetail } from "@utils/callRustService";

import TickerDetailAppletWrap from "../../components/TickerDetailAppletWrap";
import FinancialChartsGrid from "./FinancialChartsGrid";

export type TickerFundamentalsAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  isTiling: boolean;
};

export default function TickerFundamentalsApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  isTiling,
}: TickerFundamentalsAppletProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      isTiling={isTiling}
    >
      {tickerDetail && <FinancialChartsGrid tickerDetail={tickerDetail} />}
    </TickerDetailAppletWrap>
  );
}
