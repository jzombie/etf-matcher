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
  missingAuditedTickerVectorIds,
  isTickerVectorAuditPending,
  isTiling,
  children,
}: TickerViewWindowManagerAppletWrapProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      missingAuditedTickerVectorIds={missingAuditedTickerVectorIds}
      isTickerVectorAuditPending={isTickerVectorAuditPending}
      isTiling={isTiling}
    >
      {tickerDetail && (
        <>
          {tickerDetail.is_etf ? (
            <ETFAggregateDetailAppletWrap
              etfAggregateDetail={etfAggregateDetail}
              isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
              etfAggregateDetailError={etfAggregateDetailError}
              missingAuditedTickerVectorIds={missingAuditedTickerVectorIds}
              isTickerVectorAuditPending={isTickerVectorAuditPending}
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
