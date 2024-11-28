import React, { useEffect } from "react";

import { Box } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import {
  RustServiceTickerWeightedSectorDistribution,
  fetchWeightedTickerSectorDistribution,
} from "@services/RustService";
import type { TickerBucketTicker } from "@src/store";

import SectorsPieChart from "@components/SectorsPieChart";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSectorAllocationAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerSectorAllocationApplet({
  isTiling,
  ...rest
}: MultiTickerSectorAllocationAppletProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const { filteredTickerBucket } = useTickerSelectionManagerContext();

  const {
    data: majorSectorDistribution,
    execute: executeFetchWeightedTickerSectorDistribution,
  } = usePromise<
    RustServiceTickerWeightedSectorDistribution,
    [TickerBucketTicker[]]
  >({
    fn: (tickerBucketTickers) =>
      fetchWeightedTickerSectorDistribution(tickerBucketTickers),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(
        new Error("Could not fetch sector allocation distribution"),
      );
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (filteredTickerBucket) {
      executeFetchWeightedTickerSectorDistribution(
        filteredTickerBucket.tickers,
      );
    }
  }, [filteredTickerBucket, executeFetchWeightedTickerSectorDistribution]);

  return (
    <TickerBucketViewWindowManagerAppletWrap isTiling={isTiling} {...rest}>
      {majorSectorDistribution && (
        <AutoScaler>
          <SectorsPieChart majorSectorDistribution={majorSectorDistribution} />
        </AutoScaler>
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
