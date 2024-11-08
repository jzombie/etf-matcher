import React from "react";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../../components/TickerViewWindowManager.AppletWrap";
import FinancialChartsGrid from "./FinancialChartsGrid";

export type TickerFundamentalsAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function TickerFundamentalsApplet({
  tickerDetail,
  ...rest
}: TickerFundamentalsAppletProps) {
  return (
    <TickerViewWindowManagerAppletWrap tickerDetail={tickerDetail} {...rest}>
      {tickerDetail && <FinancialChartsGrid tickerDetail={tickerDetail} />}
    </TickerViewWindowManagerAppletWrap>
  );
}
