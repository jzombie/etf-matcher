import React from "react";

import ETFAggregateDetailAppletWrap, {
  ETFAggregateDetailAppletWrapProps,
} from "./TickerViewWindowManager.AppletWrap.ETFAggregateDetail";
import TickerDetailAppletWrap, {
  TickerDetailAppletWrapProps,
} from "./TickerViewWindowManager.AppletWrap.TickerDetail";

export type TickerViewWindowManagerAppletWrapProps =
  TickerDetailAppletWrapProps & ETFAggregateDetailAppletWrapProps;

export default function TickerViewWindowManagerAppletWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  isTiling,
  children,
}: TickerViewWindowManagerAppletWrapProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      isTiling={isTiling}
    >
      {tickerDetail && (
        <>
          {tickerDetail.is_etf ? (
            <ETFAggregateDetailAppletWrap
              etfAggregateDetail={etfAggregateDetail}
              isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
              etfAggregateDetailError={etfAggregateDetailError}
              isTiling={isTiling}
            >
              {children}
            </ETFAggregateDetailAppletWrap>
          ) : (
            <> {children}</>
          )}
        </>
      )}
    </TickerDetailAppletWrap>
  );
}
