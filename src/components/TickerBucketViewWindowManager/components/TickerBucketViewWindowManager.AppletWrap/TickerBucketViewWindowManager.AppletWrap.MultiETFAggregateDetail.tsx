import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceETFAggregateDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerBucketViewWindowManagerCommonProps } from "../../types";

export type MultiETFAggregateDetailAppletWrapProps =
  TickerBucketViewWindowManagerCommonProps & {
    multiETFAggregateDetails?: RustServiceETFAggregateDetail[] | null;
    isLoadingMultiETFAggregateDetails: boolean;
    multiETFAggregateDetailsError?: Error | unknown;
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
