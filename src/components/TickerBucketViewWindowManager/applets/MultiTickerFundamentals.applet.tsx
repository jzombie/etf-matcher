import React, { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";
import {
  RustServiceTicker10KDetail,
  fetchWeightedTicker10KDetail,
} from "@services/RustService";

import FinancialBarLineChart, {
  createChartData,
} from "@components/FinancialBarLineChart";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerFundamentalsAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerFundamentalsApplet({
  tickerBucketType,
  ...rest
}: MultiTickerFundamentalsAppletProps) {
  const [multiTickerFinancialDetail, setMultiTickerFinancialDetail] =
    useState<RustServiceTicker10KDetail | null>(null);

  const { filteredTickerBucket } = useTickerSelectionManagerContext();

  useEffect(() => {
    fetchWeightedTicker10KDetail(filteredTickerBucket.tickers).then(
      setMultiTickerFinancialDetail,
    );
  }, [filteredTickerBucket]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      tickerBucketType={tickerBucketType}
      {...rest}
    >
      {multiTickerFinancialDetail && (
        <Scrollable>
          <Padding>
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center" }}
              >
                The following metrics are based on a weighted average of the
                holdings in this {tickerBucketType}.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                // TODO: Dynamically size
                // gridTemplateColumns: {
                //   xs: "1fr", // 1 column on extra-small screens
                //   sm: "1fr 1fr", // 2 columns on small screens
                //   md: "1fr 1fr 1fr", // 3 columns on medium screens
                // },
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              <FinancialBarLineChart
                title="Revenue"
                chartData={createChartData(
                  multiTickerFinancialDetail.revenue_current,
                  multiTickerFinancialDetail.revenue_1_yr,
                  multiTickerFinancialDetail.revenue_2_yr,
                  multiTickerFinancialDetail.revenue_3_yr,
                  multiTickerFinancialDetail.revenue_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={0}
              />
              <FinancialBarLineChart
                title="Gross Profit"
                chartData={createChartData(
                  multiTickerFinancialDetail.gross_profit_current,
                  multiTickerFinancialDetail.gross_profit_1_yr,
                  multiTickerFinancialDetail.gross_profit_2_yr,
                  multiTickerFinancialDetail.gross_profit_3_yr,
                  multiTickerFinancialDetail.gross_profit_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={1}
              />
              <FinancialBarLineChart
                title="Operating Income"
                chartData={createChartData(
                  multiTickerFinancialDetail.operating_income_current,
                  multiTickerFinancialDetail.operating_income_1_yr,
                  multiTickerFinancialDetail.operating_income_2_yr,
                  multiTickerFinancialDetail.operating_income_3_yr,
                  multiTickerFinancialDetail.operating_income_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={2}
              />
              <FinancialBarLineChart
                title="Net Income"
                chartData={createChartData(
                  multiTickerFinancialDetail.net_income_current,
                  multiTickerFinancialDetail.net_income_1_yr,
                  multiTickerFinancialDetail.net_income_2_yr,
                  multiTickerFinancialDetail.net_income_3_yr,
                  multiTickerFinancialDetail.net_income_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={3}
              />
              <FinancialBarLineChart
                title="Total Assets"
                chartData={createChartData(
                  multiTickerFinancialDetail.total_assets_current,
                  multiTickerFinancialDetail.total_assets_1_yr,
                  multiTickerFinancialDetail.total_assets_2_yr,
                  multiTickerFinancialDetail.total_assets_3_yr,
                  multiTickerFinancialDetail.total_assets_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={4}
              />
              <FinancialBarLineChart
                title="Total Liabilities"
                chartData={createChartData(
                  multiTickerFinancialDetail.total_liabilities_current,
                  multiTickerFinancialDetail.total_liabilities_1_yr,
                  multiTickerFinancialDetail.total_liabilities_2_yr,
                  multiTickerFinancialDetail.total_liabilities_3_yr,
                  multiTickerFinancialDetail.total_liabilities_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={5}
              />
              <FinancialBarLineChart
                title="Operating Cash Flow"
                chartData={createChartData(
                  multiTickerFinancialDetail.operating_cash_flow_current,
                  multiTickerFinancialDetail.operating_cash_flow_1_yr,
                  multiTickerFinancialDetail.operating_cash_flow_2_yr,
                  multiTickerFinancialDetail.operating_cash_flow_3_yr,
                  multiTickerFinancialDetail.operating_cash_flow_4_yr,
                )}
                // TODO: Determine how this should be handled. No guarantee these are all going to be USD.
                // currencyCode={tickerDetail.currency_code}
                colorIndex={6}
              />
            </Box>
          </Padding>
        </Scrollable>
      )}
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
