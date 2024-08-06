import React, { useEffect, useMemo, useState } from "react";

import { Alert } from "@mui/material";

import Padding from "@layoutKit/Padding";
import store from "@src/store";
import {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
} from "@src/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import formatCurrency from "@utils/formatCurrency";

export type FinancialReportProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function FinancialReport({
  tickerDetail,
}: FinancialReportProps) {
  const [financialData, setFinancialData] = useState<
    RustServiceTicker10KDetail | RustServiceETFAggregateDetail | null
  >(null);

  useEffect(() => {
    if (!tickerDetail.is_etf) {
      store.fetchTicker10KDetail(tickerDetail.ticker_id).then(setFinancialData);
    } else {
      store
        .fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id)
        .then(setFinancialData);
    }
  }, [tickerDetail]);

  // const currencyCode = financialData.currency_code || "USD";
  const currencyCode = "USD";

  const chartData = useMemo(() => {
    if (!financialData) {
      return [];
    }

    const isTicker10KDetail = (
      financialData: RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
    ): financialData is RustServiceTicker10KDetail => {
      return (
        (financialData as RustServiceTicker10KDetail).calendar_year_4_yr !==
        undefined
      );
    };

    if (isTicker10KDetail(financialData)) {
      return [
        {
          year: "4 years ago",
          revenue: financialData.revenue_4_yr || 0,
          netIncome: financialData.net_income_4_yr || 0,
          operatingIncome: financialData.operating_income_4_yr || 0,
          operatingCashFlow: financialData.operating_cash_flow_4_yr || 0,
        },
        {
          year: "3 years ago",
          revenue: financialData.revenue_3_yr || 0,
          netIncome: financialData.net_income_3_yr || 0,
          operatingIncome: financialData.operating_income_3_yr || 0,
          operatingCashFlow: financialData.operating_cash_flow_3_yr || 0,
        },
        {
          year: "2 years ago",
          revenue: financialData.revenue_2_yr || 0,
          netIncome: financialData.net_income_2_yr || 0,
          operatingIncome: financialData.operating_income_2_yr || 0,
          operatingCashFlow: financialData.operating_cash_flow_2_yr || 0,
        },
        {
          year: "1 year ago",
          revenue: financialData.revenue_1_yr || 0,
          netIncome: financialData.net_income_1_yr || 0,
          operatingIncome: financialData.operating_income_1_yr || 0,
          operatingCashFlow: financialData.operating_cash_flow_1_yr || 0,
        },
        {
          year: "Current",
          revenue: financialData.revenue_current || 0,
          netIncome: financialData.net_income_current || 0,
          operatingIncome: financialData.operating_income_current || 0,
          operatingCashFlow: financialData.operating_cash_flow_current || 0,
        },
      ];
    } else {
      return [
        {
          year: "4 years ago",
          revenue: financialData.avg_revenue_4_yr || 0,
          netIncome: financialData.avg_net_income_4_yr || 0,
          operatingIncome: financialData.avg_operating_income_4_yr || 0,
          operatingCashFlow: financialData.avg_operating_cash_flow_4_yr || 0,
        },
        {
          year: "3 years ago",
          revenue: financialData.avg_revenue_3_yr || 0,
          netIncome: financialData.avg_net_income_3_yr || 0,
          operatingIncome: financialData.avg_operating_income_3_yr || 0,
          operatingCashFlow: financialData.avg_operating_cash_flow_3_yr || 0,
        },
        {
          year: "2 years ago",
          revenue: financialData.avg_revenue_2_yr || 0,
          netIncome: financialData.avg_net_income_2_yr || 0,
          operatingIncome: financialData.avg_operating_income_2_yr || 0,
          operatingCashFlow: financialData.avg_operating_cash_flow_2_yr || 0,
        },
        {
          year: "1 year ago",
          revenue: financialData.avg_revenue_1_yr || 0,
          netIncome: financialData.avg_net_income_1_yr || 0,
          operatingIncome: financialData.avg_operating_income_1_yr || 0,
          operatingCashFlow: financialData.avg_operating_cash_flow_1_yr || 0,
        },
        {
          year: "Current",
          revenue: financialData.avg_revenue_current || 0,
          netIncome: financialData.avg_net_income_current || 0,
          operatingIncome: financialData.avg_operating_income_current || 0,
          operatingCashFlow: financialData.avg_operating_cash_flow_current || 0,
        },
      ];
    }
  }, [financialData]);

  // Assume if there is no `current` data, there is no data worth rendering.
  //
  // Where `current` is this current calendar year or the previous calendar year,
  // determined by the fiscal year start of the ticker or aggregated tickers in
  // an ETF.
  const hasChartableData = useMemo(() => {
    if (!financialData) {
      return false;
    }

    const currentData = chartData.find((item) => item.year === "Current");

    if (!currentData) {
      return false;
    }

    return Object.values(currentData).some(
      (value) => typeof value === "number" && value !== 0,
    );
  }, [chartData, financialData]);

  if (!financialData) {
    return null;
  }

  if (!hasChartableData) {
    return (
      <Alert variant="filled" severity="warning">
        No renderable 10-K data available for {tickerDetail.symbol}
      </Alert>
    );
  }

  return (
    <div>
      <Padding>
        <h2>{tickerDetail.symbol} Financial Report</h2>
        <h3>Revenue and Net Income Over Years</h3>
      </Padding>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            tickFormatter={(value: number) =>
              formatCurrency(currencyCode, value)
            }
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(currencyCode, value)}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          <Line type="monotone" dataKey="netIncome" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <Padding>
        <h3>Operating Income and Operating Cash Flow</h3>
      </Padding>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            tickFormatter={(value: number) =>
              formatCurrency(currencyCode, value)
            }
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(currencyCode, value)}
          />
          <Legend />
          <Bar dataKey="operatingIncome" fill="#8884d8" />
          <Bar dataKey="operatingCashFlow" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
