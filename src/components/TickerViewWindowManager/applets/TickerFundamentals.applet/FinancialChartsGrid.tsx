import React, { useCallback } from "react";

import { Box, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
} from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

import RenderChart from "./FinancialChartsGrid.Chart";

export type FinancialChartsGridProps = {
  tickerDetail: RustServiceTickerDetail;
};

// TODO: Move to a common place (or extend `useTicker10KDetail` include this)
// Search for other instances of this same function and replace
function isETFAggregateDetail(
  data: RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
): data is RustServiceETFAggregateDetail {
  return "avg_revenue_current" in data;
}

export default function FinancialChartsGrid({
  tickerDetail,
}: FinancialChartsGridProps) {
  const { isLoading, detail: financialDetail } = useTicker10KDetail(
    tickerDetail.ticker_id,
    tickerDetail.is_etf,
  );

  // TODO: Move out of `FinancialChartsGrid` scope?
  const createChartData = useCallback(
    (
      currentValue: number | undefined,
      year1Value: number | undefined,
      year2Value: number | undefined,
      year3Value: number | undefined,
      year4Value: number | undefined,
    ) => [
      { year: "4 Years Ago", value: year4Value || 0 },
      { year: "3 Years Ago", value: year3Value || 0 },
      { year: "2 Years Ago", value: year2Value || 0 },
      { year: "1 Year Ago", value: year1Value || 0 },
      { year: "Current", value: currentValue || 0 },
    ],
    [],
  );

  if (isLoading) {
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  if (!financialDetail || !financialDetail?.are_financials_current) {
    return (
      <Center>
        <NoInformationAvailableAlert>
          No 10-K financial data available for &quot;{tickerDetail.symbol}
          &quot;.
        </NoInformationAvailableAlert>
      </Center>
    );
  }

  return (
    <Scrollable>
      <Padding>
        {/* Conditional rendering of the weighted average note */}
        {tickerDetail.is_etf && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              The following metrics are based on a weighted average of the
              holdings in the &quot;{tickerDetail.symbol}&quot; ETF.
            </Typography>
          </Box>
        )}

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
          <RenderChart
            title="Revenue"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_revenue_current
                : financialDetail.revenue_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_revenue_1_yr
                : financialDetail.revenue_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_revenue_2_yr
                : financialDetail.revenue_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_revenue_3_yr
                : financialDetail.revenue_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_revenue_4_yr
                : financialDetail.revenue_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={0}
          />
          <RenderChart
            title="Gross Profit"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_gross_profit_current
                : financialDetail.gross_profit_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_gross_profit_1_yr
                : financialDetail.gross_profit_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_gross_profit_2_yr
                : financialDetail.gross_profit_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_gross_profit_3_yr
                : financialDetail.gross_profit_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_gross_profit_4_yr
                : financialDetail.gross_profit_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={1}
          />
          <RenderChart
            title="Operating Income"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_income_current
                : financialDetail.operating_income_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_income_1_yr
                : financialDetail.operating_income_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_income_2_yr
                : financialDetail.operating_income_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_income_3_yr
                : financialDetail.operating_income_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_income_4_yr
                : financialDetail.operating_income_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={2}
          />
          <RenderChart
            title="Net Income"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_net_income_current
                : financialDetail.net_income_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_net_income_1_yr
                : financialDetail.net_income_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_net_income_2_yr
                : financialDetail.net_income_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_net_income_3_yr
                : financialDetail.net_income_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_net_income_4_yr
                : financialDetail.net_income_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={3}
          />
          <RenderChart
            title="Total Assets"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_assets_current
                : financialDetail.total_assets_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_assets_1_yr
                : financialDetail.total_assets_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_assets_2_yr
                : financialDetail.total_assets_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_assets_3_yr
                : financialDetail.total_assets_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_assets_4_yr
                : financialDetail.total_assets_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={4}
          />
          <RenderChart
            title="Total Liabilities"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_liabilities_current
                : financialDetail.total_liabilities_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_liabilities_1_yr
                : financialDetail.total_liabilities_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_liabilities_2_yr
                : financialDetail.total_liabilities_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_liabilities_3_yr
                : financialDetail.total_liabilities_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_total_liabilities_4_yr
                : financialDetail.total_liabilities_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={5}
          />
          <RenderChart
            title="Operating Cash Flow"
            chartData={createChartData(
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_cash_flow_current
                : financialDetail.operating_cash_flow_current,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_cash_flow_1_yr
                : financialDetail.operating_cash_flow_1_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_cash_flow_2_yr
                : financialDetail.operating_cash_flow_2_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_cash_flow_3_yr
                : financialDetail.operating_cash_flow_3_yr,
              isETFAggregateDetail(financialDetail)
                ? financialDetail.avg_operating_cash_flow_4_yr
                : financialDetail.operating_cash_flow_4_yr,
            )}
            financialDetail={financialDetail}
            colorIndex={6}
          />
        </Box>
      </Padding>
    </Scrollable>
  );
}
