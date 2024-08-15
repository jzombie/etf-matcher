import React from "react";

import { Box, Paper, Typography } from "@mui/material";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@src/types";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

import RenderChart from "./TickerDetail.FinancialReport.Chart";

export type FinancialReportProps = {
  tickerId: number;
  isETF: boolean;
};

function isETFAggregateDetail(
  data: RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
): data is RustServiceETFAggregateDetail {
  return "avg_revenue_current" in data;
}

export default function FinancialReport({
  tickerId,
  isETF,
}: FinancialReportProps) {
  const { isLoading, detail } = useTicker10KDetail(tickerId, isETF);

  if (isLoading || !detail) {
    return <div>Loading...</div>;
  }

  const createChartData = (
    label: string,
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
  ];

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {
          // TODO: Add ticker symbol here
        }
        Financial Overview
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // 1 column on extra-small screens
            sm: "1fr 1fr", // 2 columns on small screens
            md: "1fr 1fr 1fr", // 3 columns on medium screens
          },
          gap: 2,
        }}
      >
        <RenderChart
          title="Revenue"
          chartData={createChartData(
            "Revenue",
            isETFAggregateDetail(detail)
              ? detail.avg_revenue_current
              : detail.revenue_current,
            isETFAggregateDetail(detail)
              ? detail.avg_revenue_1_yr
              : detail.revenue_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_revenue_2_yr
              : detail.revenue_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_revenue_3_yr
              : detail.revenue_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_revenue_4_yr
              : detail.revenue_4_yr,
          )}
          detail={detail}
          colorIndex={0}
        />
        <RenderChart
          title="Gross Profit"
          chartData={createChartData(
            "Gross Profit",
            isETFAggregateDetail(detail)
              ? detail.avg_gross_profit_current
              : detail.gross_profit_current,
            isETFAggregateDetail(detail)
              ? detail.avg_gross_profit_1_yr
              : detail.gross_profit_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_gross_profit_2_yr
              : detail.gross_profit_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_gross_profit_3_yr
              : detail.gross_profit_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_gross_profit_4_yr
              : detail.gross_profit_4_yr,
          )}
          detail={detail}
          colorIndex={1}
        />
        <RenderChart
          title="Operating Income"
          chartData={createChartData(
            "Operating Income",
            isETFAggregateDetail(detail)
              ? detail.avg_operating_income_current
              : detail.operating_income_current,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_income_1_yr
              : detail.operating_income_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_income_2_yr
              : detail.operating_income_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_income_3_yr
              : detail.operating_income_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_income_4_yr
              : detail.operating_income_4_yr,
          )}
          detail={detail}
          colorIndex={2}
        />
        <RenderChart
          title="Net Income"
          chartData={createChartData(
            "Net Income",
            isETFAggregateDetail(detail)
              ? detail.avg_net_income_current
              : detail.net_income_current,
            isETFAggregateDetail(detail)
              ? detail.avg_net_income_1_yr
              : detail.net_income_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_net_income_2_yr
              : detail.net_income_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_net_income_3_yr
              : detail.net_income_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_net_income_4_yr
              : detail.net_income_4_yr,
          )}
          detail={detail}
          colorIndex={3}
        />
        <RenderChart
          title="Total Assets"
          chartData={createChartData(
            "Total Assets",
            isETFAggregateDetail(detail)
              ? detail.avg_total_assets_current
              : detail.total_assets_current,
            isETFAggregateDetail(detail)
              ? detail.avg_total_assets_1_yr
              : detail.total_assets_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_assets_2_yr
              : detail.total_assets_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_assets_3_yr
              : detail.total_assets_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_assets_4_yr
              : detail.total_assets_4_yr,
          )}
          detail={detail}
          colorIndex={4}
        />
        <RenderChart
          title="Total Liabilities"
          chartData={createChartData(
            "Total Liabilities",
            isETFAggregateDetail(detail)
              ? detail.avg_total_liabilities_current
              : detail.total_liabilities_current,
            isETFAggregateDetail(detail)
              ? detail.avg_total_liabilities_1_yr
              : detail.total_liabilities_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_liabilities_2_yr
              : detail.total_liabilities_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_liabilities_3_yr
              : detail.total_liabilities_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_total_liabilities_4_yr
              : detail.total_liabilities_4_yr,
          )}
          detail={detail}
          colorIndex={5}
        />
        <RenderChart
          title="Operating Cash Flow"
          chartData={createChartData(
            "Operating Cash Flow",
            isETFAggregateDetail(detail)
              ? detail.avg_operating_cash_flow_current
              : detail.operating_cash_flow_current,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_cash_flow_1_yr
              : detail.operating_cash_flow_1_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_cash_flow_2_yr
              : detail.operating_cash_flow_2_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_cash_flow_3_yr
              : detail.operating_cash_flow_3_yr,
            isETFAggregateDetail(detail)
              ? detail.avg_operating_cash_flow_4_yr
              : detail.operating_cash_flow_4_yr,
          )}
          detail={detail}
          colorIndex={6}
        />
      </Box>
    </Paper>
  );
}
