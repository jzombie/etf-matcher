import React, { useEffect } from "react";

import { Box } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import {
  RustServiceTickerDetail,
  RustServiceTickerWeightedSectorDistribution,
  fetchWeightedTickerSectorDistribution,
} from "@services/RustService";

import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import SectorsPieChart from "@components/SectorsPieChart";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../components/TickerViewWindowManager.AppletWrap";

export type SectorAllocationAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function SectorAllocationApplet({
  tickerDetail,
  etfAggregateDetail,
  ...rest
}: SectorAllocationAppletProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const {
    data: majorSectorDistribution,
    execute: executeFetchWeightedTickerSectorDistribution,
  } = usePromise<
    RustServiceTickerWeightedSectorDistribution,
    [RustServiceTickerDetail]
  >({
    fn: (tickerDetail) =>
      fetchWeightedTickerSectorDistribution([
        {
          tickerId: tickerDetail.ticker_id,
          symbol: tickerDetail.symbol,
          // Explicitly hardcode to 1 for single-ticker mode
          quantity: 1,
        },
      ]),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(
        new Error("Could not fetch sector allocation distribution"),
      );
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerDetail) {
      executeFetchWeightedTickerSectorDistribution(tickerDetail);
    }
  }, [tickerDetail, executeFetchWeightedTickerSectorDistribution]);

  return (
    <TickerViewWindowManagerAppletWrap
      tickerDetail={tickerDetail}
      etfAggregateDetail={etfAggregateDetail}
      {...rest}
    >
      <>
        {majorSectorDistribution ? (
          <AutoScaler>
            {
              // Note: The 500x320 is used solely for aspect ratio.
            }
            <Box sx={{ width: 500, height: 320 }}>
              <SectorsPieChart
                majorSectorDistribution={majorSectorDistribution}
              />
            </Box>
          </AutoScaler>
        ) : (
          <Center>
            <NoInformationAvailableAlert>
              No sector allocation information is available for &quot;
              {tickerDetail?.symbol}&quot;.
            </NoInformationAvailableAlert>
          </Center>
        )}
      </>
    </TickerViewWindowManagerAppletWrap>
  );
}
