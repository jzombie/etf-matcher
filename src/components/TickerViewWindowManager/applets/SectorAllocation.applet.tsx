import React, { useEffect } from "react";

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
          symbol: tickerDetail.ticker_symbol,
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
            <SectorsPieChart
              majorSectorDistribution={majorSectorDistribution}
            />
          </AutoScaler>
        ) : (
          <Center>
            <NoInformationAvailableAlert>
              No sector allocation information is available for &quot;
              {tickerDetail?.ticker_symbol}&quot;.
            </NoInformationAvailableAlert>
          </Center>
        )}
      </>
    </TickerViewWindowManagerAppletWrap>
  );
}
