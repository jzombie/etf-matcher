import React, { useEffect, useState } from "react";

import store from "@src/store";
import {
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
  const [financialData, setFinancialData] =
    useState<RustServiceTicker10KDetail | null>(null);

  useEffect(() => {
    if (!tickerDetail.is_etf) {
      store.fetchTicker10KDetail(tickerDetail.ticker_id).then(setFinancialData);
    }
  }, [tickerDetail]);

  if (!financialData) {
    return null;
  }

  // TODO: Don't hardcode "USD"; `ticker_detail` needs to relay the currency code
  const currencyCode = "USD";

  const data = [
    {
      // year: "4 Years Ago",
      year: financialData.calendar_year_4_yr,
      //
      revenue: financialData.revenue_4_yr || 0,
      netIncome: financialData.net_income_4_yr || 0,
      operatingIncome: financialData.operating_income_4_yr || 0,
      operatingCashFlow: financialData.operating_cash_flow_4_yr || 0,
    },
    {
      // year: "3 Years Ago",
      year: financialData.calendar_year_3_yr,
      //
      revenue: financialData.revenue_3_yr || 0,
      netIncome: financialData.net_income_3_yr || 0,
      operatingIncome: financialData.operating_income_3_yr || 0,
      operatingCashFlow: financialData.operating_cash_flow_3_yr || 0,
    },
    {
      // year: "2 Years Ago",
      year: financialData.calendar_year_2_yr,
      //
      revenue: financialData.revenue_2_yr || 0,
      netIncome: financialData.net_income_2_yr || 0,
      operatingIncome: financialData.operating_income_2_yr || 0,
      operatingCashFlow: financialData.operating_cash_flow_2_yr || 0,
    },
    {
      // year: "1 Year Ago",
      year: financialData.calendar_year_1_yr,
      //
      revenue: financialData.revenue_1_yr || 0,
      netIncome: financialData.net_income_1_yr || 0,
      operatingIncome: financialData.operating_income_1_yr || 0,
      operatingCashFlow: financialData.operating_cash_flow_1_yr || 0,
    },
    {
      // year: "Current",
      year: financialData.calendar_year_current,
      //
      revenue: financialData.revenue_current || 0,
      netIncome: financialData.net_income_current || 0,
      operatingIncome: financialData.operating_income_current || 0,
      operatingCashFlow: financialData.operating_cash_flow_current || 0,
    },
  ];

  return (
    <div>
      <h2>Financial Report</h2>
      <h3>Revenue and Net Income Over Years</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
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

      <h3>Operating Income and Operating Cash Flow</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
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
