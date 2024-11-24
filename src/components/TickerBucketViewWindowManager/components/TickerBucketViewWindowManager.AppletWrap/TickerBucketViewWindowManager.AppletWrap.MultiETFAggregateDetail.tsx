import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
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
  if (adjustedETFAggregateDetailsError) {
    return (
      <Alert severity="error">
        Could not load ETF aggregate detail at this time. Please try again
        later.
      </Alert>
    );
  }

  return (
    <Full>
      {adjustedETFAggregateDetails && <>{children}</>}
      <Cover clickThrough>
        {isLoadingAdjustedETFAggregateDetails && (
          // FIXME: Don't use `Center` if not tiling?
          <Center>
            <NetworkProgressIndicator />
          </Center>
        )}
      </Cover>
    </Full>
  );
}
