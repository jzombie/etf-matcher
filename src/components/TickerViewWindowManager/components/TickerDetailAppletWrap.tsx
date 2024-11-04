import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

export type TickerDetailAppletWrapProps = {
  tickerDetail?: RustServiceTickerDetail | null;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  isTiling: boolean; // TODO: Refactor to use common types, so this can be excluded specifically from here (potentially in: https://linear.app/zenosmosis/issue/ZEN-128/re-use-tickerdetail-layouts-for-bucket-views)
  children: React.ReactNode;
};

export default function TickerDetailAppletWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  children,
}: TickerDetailAppletWrapProps) {
  if (isLoadingTickerDetail) {
    // FIXME: Don't use `Center` if not tiling?
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (tickerDetailError) {
    return (
      <Alert severity="error">
        Could not load ticker detail at this time. Please try again later.
      </Alert>
    );
  }

  if (tickerDetail) {
    return <>{children}</>;
  }
}
