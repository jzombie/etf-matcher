import React from "react";

import { Alert, CircularProgress } from "@mui/material";

import Center from "@layoutKit/Center";

import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import TickerDetailAppletWrap from "./TickerDetailAppletWrap";

export type ETFAggregateDetailAppletWrapProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
  children: React.ReactNode;
};

export default function ETFAggregateDetailAppletWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  children,
}: ETFAggregateDetailAppletWrapProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
    >
      {tickerDetail && (
        <>
          {tickerDetail.is_etf ? (
            <ETFAggregateChildrenWrap
              etfAggregateDetail={etfAggregateDetail}
              isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
              etfAggregateDetailError={etfAggregateDetailError}
            >
              {children}
            </ETFAggregateChildrenWrap>
          ) : (
            <> {children}</>
          )}
        </>
      )}
    </TickerDetailAppletWrap>
  );
}

type ETFAggregateChildrenWrapProps = {
  etfAggregateDetail?: ETFAggregateDetailAppletWrapProps["etfAggregateDetail"];
  isLoadingETFAggregateDetail: ETFAggregateDetailAppletWrapProps["isLoadingETFAggregateDetail"];
  etfAggregateDetailError?: ETFAggregateDetailAppletWrapProps["etfAggregateDetailError"];
  children: React.ReactNode;
};

function ETFAggregateChildrenWrap({
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  children,
}: ETFAggregateChildrenWrapProps) {
  if (isLoadingETFAggregateDetail) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  if (etfAggregateDetailError) {
    return (
      <Alert severity="error">
        Could not load ETF aggregate detail at this time. Please try again
        later.
      </Alert>
    );
  }

  if (etfAggregateDetail) {
    return <>{children}</>;
  }
}
