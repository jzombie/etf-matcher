import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import type { TickerBucketViewWindowManagerCommonProps } from "../../types";

export type MultiTickerDetailsAppletWrapProps =
  TickerBucketViewWindowManagerCommonProps & {
    multiTickerDetails?: RustServiceTickerDetail[] | null;
    isLoadingMultiTickerDetails: boolean;
    multiTickerDetailsError?: Error | unknown;
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
