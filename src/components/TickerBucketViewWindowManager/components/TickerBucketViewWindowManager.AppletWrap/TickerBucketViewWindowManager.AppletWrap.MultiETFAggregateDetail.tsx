import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceETFAggregateDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

export type MultiETFAggregateDetailAppletWrapProps = {
  tickerBucketType: string;
  multiETFAggregateDetails?: RustServiceETFAggregateDetail[] | null;
  formattedSymbolsWithExchange?: string[] | null;
  isLoadingMultiETFAggregateDetails: boolean;
  multiETFAggregateDetailsError?: Error | unknown;
  isTiling: boolean; // TODO: Refactor to use common types, so this can be excluded specifically from here (potentially in: https://linear.app/zenosmosis/issue/ZEN-128/re-use-tickerdetail-layouts-for-bucket-views)
  children: React.ReactNode;
};

export default function MultiETFAggregateDetailAppletWrap({
  multiETFAggregateDetails,
  isLoadingMultiETFAggregateDetails,
  multiETFAggregateDetailsError,
  children,
}: MultiETFAggregateDetailAppletWrapProps) {
  if (isLoadingMultiETFAggregateDetails) {
    return (
      // FIXME: Don't use `Center` if not tiling?
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (multiETFAggregateDetailsError) {
    return (
      <Alert severity="error">
        Could not load ETF aggregate detail at this time. Please try again
        later.
      </Alert>
    );
  }

  if (multiETFAggregateDetails) {
    return <>{children}</>;
  }
}
