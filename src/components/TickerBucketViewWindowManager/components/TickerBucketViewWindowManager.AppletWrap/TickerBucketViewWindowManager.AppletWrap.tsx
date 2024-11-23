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
  multiTickerDetails,
  isLoadingMultiTickerDetails,
  multiTickerDetailsError,
  multiETFAggregateDetails,
  isLoadingMultiETFAggregateDetails,
  multiETFAggregateDetailsError,
  isTiling,
  children,
}: TickerBucketViewWindowManagerAppletWrapProps) {
  return (
    <MultiTickerDetailsAppletWrap
      tickerBucketType={tickerBucketType}
      multiTickerDetails={multiTickerDetails}
      isLoadingMultiTickerDetails={isLoadingMultiTickerDetails}
      multiTickerDetailsError={multiTickerDetailsError}
      isTiling={isTiling}
    >
      {multiTickerDetails && (
        <>
          {multiTickerDetails.some((ticker) => ticker.is_etf) ? (
            <MultiETFAggregateDetailAppletWrap
              tickerBucketType={tickerBucketType}
              multiETFAggregateDetails={multiETFAggregateDetails}
              isLoadingMultiETFAggregateDetails={
                isLoadingMultiETFAggregateDetails
              }
              multiETFAggregateDetailsError={multiETFAggregateDetailsError}
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
