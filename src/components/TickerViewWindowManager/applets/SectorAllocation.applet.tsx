import React from "react";

import Center from "@layoutKit/Center";

import SectorsPieChart from "@components/SectorsPieChart";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";

import ETFAggregateDetailAppletWrap from "../components/ETFAggregateDetailAppletWrap";

export type SectorAllocationAppletProps = {
  tickerDetail?: RustServiceTickerDetail;
  isLoadingTickerDetail: boolean;
  tickerDetailError?: Error | unknown;
  etfAggregateDetail?: RustServiceETFAggregateDetail;
  isLoadingETFAggregateDetail: boolean;
  etfAggregateDetailError?: Error | unknown;
};

export default function SectorAllocationApplet({
  tickerDetail,
  isLoadingTickerDetail,
  tickerDetailError,
  etfAggregateDetail,
  isLoadingETFAggregateDetail,
  etfAggregateDetailError,
}: SectorAllocationAppletProps) {
  return (
    <ETFAggregateDetailAppletWrap
      tickerDetail={tickerDetail}
      isLoadingTickerDetail={isLoadingTickerDetail}
      tickerDetailError={tickerDetailError}
      etfAggregateDetail={etfAggregateDetail}
      isLoadingETFAggregateDetail={isLoadingETFAggregateDetail}
      etfAggregateDetailError={etfAggregateDetailError}
    >
      <>
        {etfAggregateDetail?.major_sector_distribution && (
          <Center>
            <SectorsPieChart
              majorSectorDistribution={
                etfAggregateDetail.major_sector_distribution
              }
            />
          </Center>
        )}
      </>
    </ETFAggregateDetailAppletWrap>
  );
}
