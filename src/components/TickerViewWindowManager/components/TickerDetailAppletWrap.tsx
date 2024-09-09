import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerDetailAppletWrapProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  isTiling: boolean;
  children: React.ReactNode;
};

export default function TickerDetailAppletWrap({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  isTiling,
  children,
}: TickerDetailAppletWrapProps) {
  if (isLoadingTickerDetail) {
    // TODO: Don't use `Center` if not tiling
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
