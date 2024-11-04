import React, { useMemo } from "react";

import { Box } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@services/RustService";

import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import SectorsPieChart from "@components/SectorsPieChart";

import ETFAggregateDetailAppletWrap from "../components/ETFAggregateDetailAppletWrap";

export type SectorAllocationAppletProps = {
  tickerDetail?: RustServiceTickerDetail | null;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail | null;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
  isTiling: boolean;
};

export default function SectorAllocationApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
  isTiling,
}: SectorAllocationAppletProps) {
  const distribution: RustServiceETFAggregateDetail["major_sector_distribution"] =
    useMemo(() => {
      if (etfAggregateDetail?.major_sector_distribution) {
        return etfAggregateDetail?.major_sector_distribution;
      } else if (tickerDetail?.sector_name) {
        return [
          {
            major_sector_name: tickerDetail.sector_name,
            weight: 1,
          },
        ];
      }
    }, [
      etfAggregateDetail?.major_sector_distribution,
      tickerDetail?.sector_name,
    ]);

  return (
    <ETFAggregateDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      etfAggregateDetail={etfAggregateDetail}
      isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
      etfAggregateDetailError={etfAggregateDetailError}
      isTiling={isTiling}
    >
      <>
        {distribution ? (
          <AutoScaler>
            <Box sx={{ width: 500, height: 320 }}>
              <SectorsPieChart majorSectorDistribution={distribution} />
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
    </ETFAggregateDetailAppletWrap>
  );
}
