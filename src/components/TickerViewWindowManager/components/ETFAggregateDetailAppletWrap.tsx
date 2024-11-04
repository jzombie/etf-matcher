import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import TickerDetailAppletWrap from "./TickerDetailAppletWrap";

export type ETFAggregateDetailAppletWrapProps = {
  tickerDetail?: RustServiceTickerDetail | null;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail | null;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
  isTiling: boolean;
  children: React.ReactNode;
};

export default function ETFAggregateDetailAppletWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  isTiling,
  children,
}: ETFAggregateDetailAppletWrapProps) {
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
            <ETFAggregateChildrenWrap
              etfAggregateDetail={etfAggregateDetail}
              isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
              etfAggregateDetailError={etfAggregateDetailError}
              isTiling={isTiling}
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
  isTiling: ETFAggregateDetailAppletWrapProps["isTiling"];
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
      // FIXME: Don't use `Center` if not tiling?
      <Center>
        <NetworkProgressIndicator />
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
