import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceETFAggregateDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerBucketViewWindowManagerCommonProps } from "../../types";

export type MultiETFAggregateDetailAppletWrapProps =
  TickerBucketViewWindowManagerCommonProps & {
    adjustedETFAggregateDetails?: RustServiceETFAggregateDetail[] | null;
    isLoadingAdjustedETFAggregateDetails: boolean;
    adjustedETFAggregateDetailsError?: Error | null;
    children: React.ReactNode;
  };

// TODO: Render loading indicator
export default function MultiETFAggregateDetailAppletWrap({
  adjustedETFAggregateDetails,
  isLoadingAdjustedETFAggregateDetails,
  adjustedETFAggregateDetailsError,
  children,
}: MultiETFAggregateDetailAppletWrapProps) {
  if (isLoadingAdjustedETFAggregateDetails) {
    return (
      // FIXME: Don't use `Center` if not tiling?
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (adjustedETFAggregateDetailsError) {
    return (
      <Alert severity="error">
        Could not load ETF aggregate detail at this time. Please try again
        later.
      </Alert>
    );
  }

  if (adjustedETFAggregateDetails) {
    return <>{children}</>;
  }
}
