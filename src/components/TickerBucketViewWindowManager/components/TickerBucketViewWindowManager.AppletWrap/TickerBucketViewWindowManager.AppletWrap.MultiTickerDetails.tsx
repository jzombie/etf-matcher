import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerBucketViewWindowManagerCommonProps } from "../../types";

export type MultiTickerDetailsAppletWrapProps =
  TickerBucketViewWindowManagerCommonProps & {
    adjustedTickerDetails?: RustServiceTickerDetail[] | null;
    isLoadingAdjustedTickerDetails: boolean;
    adjustedTickerDetailsError?: Error | null;
    children: React.ReactNode;
  };

// TODO: Render loading indicator
export default function MultiTickerDetailsAppletWrap({
  adjustedTickerDetails,
  isLoadingAdjustedTickerDetails,
  adjustedTickerDetailsError,
  children,
}: MultiTickerDetailsAppletWrapProps) {
  if (isLoadingAdjustedTickerDetails) {
    // FIXME: Don't use `Center` if not tiling?
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (adjustedTickerDetailsError) {
    return (
      <Alert severity="error">
        Could not load ticker detail at this time. Please try again later.
      </Alert>
    );
  }

  if (adjustedTickerDetails) {
    return <>{children}</>;
  }
}
