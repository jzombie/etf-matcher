import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerViewWindowManagerCommonProps } from "../../types";

export type TickerDetailAppletWrapProps = TickerViewWindowManagerCommonProps & {
  tickerDetail?: RustServiceTickerDetail | null;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
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
