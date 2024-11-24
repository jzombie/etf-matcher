import React from "react";

import { Alert } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
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
  if (adjustedTickerDetailsError) {
    return (
      <Alert severity="error">
        Could not load ticker detail at this time. Please try again later.
      </Alert>
    );
  }

  return (
    <Full>
      {adjustedTickerDetails && <>{children}</>}
      <Cover clickThrough>
        {isLoadingAdjustedTickerDetails && (
          // FIXME: Don't use `Center` if not tiling?
          <Center>
            <NetworkProgressIndicator />
          </Center>
        )}
      </Cover>
    </Full>
  );
}
