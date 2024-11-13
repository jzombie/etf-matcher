import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

export type MultiTickerDetailsAppletWrapProps = {
  multiTickerDetails?: RustServiceTickerDetail[] | null;
  formattedSymbolsWithExchange?: string[] | null;
  isLoadingMultiTickerDetails: boolean;
  multiTickerDetailsError?: Error | unknown;
  isTiling: boolean; // TODO: Refactor to use common types, so this can be excluded specifically from here (potentially in: https://linear.app/zenosmosis/issue/ZEN-128/re-use-tickerdetail-layouts-for-bucket-views)
  children: React.ReactNode;
};

export default function MultiTickerDetailsAppletWrap({
  multiTickerDetails,
  isLoadingMultiTickerDetails,
  multiTickerDetailsError,
  children,
}: MultiTickerDetailsAppletWrapProps) {
  if (isLoadingMultiTickerDetails) {
    // FIXME: Don't use `Center` if not tiling?
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (multiTickerDetailsError) {
    return (
      <Alert severity="error">
        Could not load ticker detail at this time. Please try again later.
      </Alert>
    );
  }

  if (multiTickerDetails) {
    return <>{children}</>;
  }
}
