import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceETFAggregateDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerViewWindowManagerCommonProps } from "../../types";

export type ETFAggregateDetailAppletWrapProps =
  TickerViewWindowManagerCommonProps & {
    etfAggregateDetail?: RustServiceETFAggregateDetail | null;
    isLoadingETFAggregateDetail: boolean;
    etfAggregateDetailError?: Error | unknown;
    children: React.ReactNode;
  };

export default function ETFAggregateDetailAppletWrap({
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  children,
}: ETFAggregateDetailAppletWrapProps) {
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
