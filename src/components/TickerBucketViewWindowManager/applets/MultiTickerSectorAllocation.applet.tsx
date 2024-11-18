import React, { useEffect } from "react";

import { Box } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import {
  RustServiceTickerWeightedSectorDistribution,
  fetchWeightedTickerSectorDistribution,
} from "@services/RustService";
import type { TickerBucketTicker } from "@src/store";

import SectorsPieChart from "@components/SectorsPieChart";

import usePromise from "@hooks/usePromise";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSectorAllocationAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerSectorAllocationApplet({
  formattedSymbolsWithExchange,
  isTiling,
  ...rest
}: MultiTickerSectorAllocationAppletProps) {
  const { adjustedTickerBucket } = useTickerSelectionManagerContext();

  const {
    data: distribution,
    execute: executeFetchWeightedTickerSectorDistribution,
  } = usePromise<
    RustServiceTickerWeightedSectorDistribution,
    [TickerBucketTicker[]]
  >({
    fn: (tickerBucketTickers) =>
      fetchWeightedTickerSectorDistribution(tickerBucketTickers),
    autoExecute: false,
  });

  useEffect(() => {
    if (adjustedTickerBucket) {
      executeFetchWeightedTickerSectorDistribution(
        adjustedTickerBucket.tickers,
      );
    }
  }, [adjustedTickerBucket, executeFetchWeightedTickerSectorDistribution]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      isTiling={isTiling}
      formattedSymbolsWithExchange={formattedSymbolsWithExchange}
      {...rest}
    >
      {distribution && (
        <AutoScaler>
          <Box sx={{ width: 500, height: 320 }}>
            <SectorsPieChart majorSectorDistribution={distribution} />
          </Box>
        </AutoScaler>
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
