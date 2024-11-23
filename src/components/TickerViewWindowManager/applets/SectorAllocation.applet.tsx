import React, { useMemo } from "react";

import { Box } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import type { RustServiceETFAggregateDetail } from "@services/RustService";

import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";
import SectorsPieChart from "@components/SectorsPieChart";

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
    <TickerViewWindowManagerAppletWrap
      tickerDetail={tickerDetail}
      etfAggregateDetail={etfAggregateDetail}
      {...rest}
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
    </TickerViewWindowManagerAppletWrap>
  );
}
