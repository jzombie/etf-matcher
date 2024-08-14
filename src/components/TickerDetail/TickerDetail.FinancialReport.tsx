import React from "react";

import {
  Box,
  Divider,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@src/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

import formatCurrency from "@utils/formatCurrency";

export type FinancialReportProps = {
  tickerId: number;
  isETF: boolean;
};

// Type guard to determine if the data is RustServiceETFAggregateDetail
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

  const theme = useTheme();

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

  const renderChart = (
    title: string,
    currentKey:
      | keyof RustServiceTicker10KDetail
      | keyof RustServiceETFAggregateDetail,
    year1Key:
      | keyof RustServiceTicker10KDetail
      | keyof RustServiceETFAggregateDetail,
    year2Key:
      | keyof RustServiceTicker10KDetail
      | keyof RustServiceETFAggregateDetail,
    year3Key:
      | keyof RustServiceTicker10KDetail
      | keyof RustServiceETFAggregateDetail,
    year4Key:
      | keyof RustServiceTicker10KDetail
      | keyof RustServiceETFAggregateDetail,
  ) => {
    const current = detail[currentKey as keyof typeof detail];
    const year1 = detail[year1Key as keyof typeof detail];
    const year2 = detail[year2Key as keyof typeof detail];
    const year3 = detail[year3Key as keyof typeof detail];
    const year4 = detail[year4Key as keyof typeof detail];

    const chartData = createChartData(
      title,
      current as number,
      year1 as number,
      year2 as number,
      year3 as number,
      year4 as number,
    );

    return (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="subtitle2" sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={(props) => <CustomTick {...props} />} // Spread props into CustomTick
            />
            <YAxis
              tickFormatter={(value: number) =>
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
              padding={{ top: 20, bottom: 0 }}
            />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(
                  isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                  value,
                )
              }
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Financial Overview
      </Typography>
      {renderChart(
        "Revenue",
        isETF ? "avg_revenue_current" : "revenue_current",
        isETF ? "avg_revenue_1_yr" : "revenue_1_yr",
        isETF ? "avg_revenue_2_yr" : "revenue_2_yr",
        isETF ? "avg_revenue_3_yr" : "revenue_3_yr",
        isETF ? "avg_revenue_4_yr" : "revenue_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Gross Profit",
        isETF ? "avg_gross_profit_current" : "gross_profit_current",
        isETF ? "avg_gross_profit_1_yr" : "gross_profit_1_yr",
        isETF ? "avg_gross_profit_2_yr" : "gross_profit_2_yr",
        isETF ? "avg_gross_profit_3_yr" : "gross_profit_3_yr",
        isETF ? "avg_gross_profit_4_yr" : "gross_profit_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Operating Income",
        isETF ? "avg_operating_income_current" : "operating_income_current",
        isETF ? "avg_operating_income_1_yr" : "operating_income_1_yr",
        isETF ? "avg_operating_income_2_yr" : "operating_income_2_yr",
        isETF ? "avg_operating_income_3_yr" : "operating_income_3_yr",
        isETF ? "avg_operating_income_4_yr" : "operating_income_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Net Income",
        isETF ? "avg_net_income_current" : "net_income_current",
        isETF ? "avg_net_income_1_yr" : "net_income_1_yr",
        isETF ? "avg_net_income_2_yr" : "net_income_2_yr",
        isETF ? "avg_net_income_3_yr" : "net_income_3_yr",
        isETF ? "avg_net_income_4_yr" : "net_income_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Total Assets",
        isETF ? "avg_total_assets_current" : "total_assets_current",
        isETF ? "avg_total_assets_1_yr" : "total_assets_1_yr",
        isETF ? "avg_total_assets_2_yr" : "total_assets_2_yr",
        isETF ? "avg_total_assets_3_yr" : "total_assets_3_yr",
        isETF ? "avg_total_assets_4_yr" : "total_assets_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Total Liabilities",
        isETF ? "avg_total_liabilities_current" : "total_liabilities_current",
        isETF ? "avg_total_liabilities_1_yr" : "total_liabilities_1_yr",
        isETF ? "avg_total_liabilities_2_yr" : "total_liabilities_2_yr",
        isETF ? "avg_total_liabilities_3_yr" : "total_liabilities_3_yr",
        isETF ? "avg_total_liabilities_4_yr" : "total_liabilities_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderChart(
        "Operating Cash Flow",
        isETF
          ? "avg_operating_cash_flow_current"
          : "operating_cash_flow_current",
        isETF ? "avg_operating_cash_flow_1_yr" : "operating_cash_flow_1_yr",
        isETF ? "avg_operating_cash_flow_2_yr" : "operating_cash_flow_2_yr",
        isETF ? "avg_operating_cash_flow_3_yr" : "operating_cash_flow_3_yr",
        isETF ? "avg_operating_cash_flow_4_yr" : "operating_cash_flow_4_yr",
      )}
    </Paper>
  );
}

type CustomTickProps = {
  x: number;
  y: number;
  payload: {
    value: string;
  };
  // Include any additional props if needed
};

// Custom tick component to handle rotation
function CustomTick({ x, y, payload }: CustomTickProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      transform={`rotate(-15, ${x}, ${y})`}
      fill="#666" // Set the text color (adjust color as needed)
    >
      {payload.value}
    </text>
  );
}
