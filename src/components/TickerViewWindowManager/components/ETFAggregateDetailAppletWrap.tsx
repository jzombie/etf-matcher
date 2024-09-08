import React from "react";

import { Alert, CircularProgress } from "@mui/material";

import Center from "@layoutKit/Center";

import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import TickerDetailAppletWrap from "./TickerDetailAppletWrap";

export type ETFAggregateDetailWrapProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
  children: React.ReactNode;
};

export default function ETFAggregateDetailWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  children,
}: ETFAggregateDetailWrapProps) {
  return (
    <TickerDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
    >
      <ETFAggregateWrap
        etfAggregateDetail={etfAggregateDetail}
        isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
        etfAggregateDetailError={etfAggregateDetailError}
      >
        {children}
      </ETFAggregateWrap>
    </TickerDetailAppletWrap>
  );
}

type ETFAggregateWrapProps = {
  etfAggregateDetail?: ETFAggregateDetailWrapProps["etfAggregateDetail"];
  isLoadingETFAggregateDetail: ETFAggregateDetailWrapProps["isLoadingETFAggregateDetail"];
  etfAggregateDetailError?: ETFAggregateDetailWrapProps["etfAggregateDetailError"];
  children: React.ReactNode;
};

function ETFAggregateWrap({
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  children,
}: ETFAggregateWrapProps) {
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
        Could not load ticker detail at this time. Please try again later.
      </Alert>
    );
  }

  if (etfAggregateDetail) {
    return <>{children}</>;
  }
}
