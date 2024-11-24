import React from "react";

import MultiETFAggregateDetailAppletWrap, {
  MultiETFAggregateDetailAppletWrapProps,
} from "./TickerBucketViewWindowManager.AppletWrap.MultiETFAggregateDetail";
import MultiTickerDetailsAppletWrap, {
  MultiTickerDetailsAppletWrapProps,
} from "./TickerBucketViewWindowManager.AppletWrap.MultiTickerDetails";

export type TickerBucketViewWindowManagerAppletWrapProps =
  MultiTickerDetailsAppletWrapProps & MultiETFAggregateDetailAppletWrapProps;

export default function TickerBucketViewWindowManagerAppletWrap({
  tickerBucketType,
  adjustedTickerDetails,
  isLoadingAdjustedTickerDetails,
  adjustedTickerDetailsError,
  adjustedETFAggregateDetails,
  isLoadingAdjustedETFAggregateDetails,
  adjustedETFAggregateDetailsError,
  isTiling,
  children,
}: TickerBucketViewWindowManagerAppletWrapProps) {
  return (
    <MultiTickerDetailsAppletWrap
      tickerBucketType={tickerBucketType}
      adjustedTickerDetails={adjustedTickerDetails}
      isLoadingAdjustedTickerDetails={isLoadingAdjustedTickerDetails}
      adjustedTickerDetailsError={adjustedTickerDetailsError}
      isTiling={isTiling}
    >
      {adjustedTickerDetails && (
        <>
          {adjustedTickerDetails.some((ticker) => ticker.is_etf) ? (
            <MultiETFAggregateDetailAppletWrap
              tickerBucketType={tickerBucketType}
              adjustedETFAggregateDetails={adjustedETFAggregateDetails}
              isLoadingAdjustedETFAggregateDetails={
                isLoadingAdjustedETFAggregateDetails
              }
              adjustedETFAggregateDetailsError={
                adjustedETFAggregateDetailsError
              }
              isTiling={isTiling}
            >
              {children}
            </MultiETFAggregateDetailAppletWrap>
          ) : (
            <> {children}</>
          )}
        </>
      )}
    </MultiTickerDetailsAppletWrap>
  );
}
