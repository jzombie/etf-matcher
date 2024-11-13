import React, { useCallback } from "react";

import { Box, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";
import type { RustServiceTickerDetail } from "@services/RustService";

import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";

import useTicker10KDetail from "@hooks/useTicker10KDetail";

import FinancialChartsGridChart from "./FinancialChartsGrid.Chart";

export type FinancialChartsGridProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function FinancialChartsGrid({
  tickerDetail,
}: FinancialChartsGridProps) {
  const { isLoading, detail: financialDetail } = useTicker10KDetail(
    tickerDetail.ticker_id,
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
          <FinancialChartsGridChart
            title="Revenue"
            chartData={createChartData(
              financialDetail.revenue_current,
              financialDetail.revenue_1_yr,
              financialDetail.revenue_2_yr,
              financialDetail.revenue_3_yr,
              financialDetail.revenue_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={0}
          />
          <FinancialChartsGridChart
            title="Gross Profit"
            chartData={createChartData(
              financialDetail.gross_profit_current,
              financialDetail.gross_profit_1_yr,
              financialDetail.gross_profit_2_yr,
              financialDetail.gross_profit_3_yr,
              financialDetail.gross_profit_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={1}
          />
          <FinancialChartsGridChart
            title="Operating Income"
            chartData={createChartData(
              financialDetail.operating_income_current,
              financialDetail.operating_income_1_yr,
              financialDetail.operating_income_2_yr,
              financialDetail.operating_income_3_yr,
              financialDetail.operating_income_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={2}
          />
          <FinancialChartsGridChart
            title="Net Income"
            chartData={createChartData(
              financialDetail.net_income_current,
              financialDetail.net_income_1_yr,
              financialDetail.net_income_2_yr,
              financialDetail.net_income_3_yr,
              financialDetail.net_income_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={3}
          />
          <FinancialChartsGridChart
            title="Total Assets"
            chartData={createChartData(
              financialDetail.total_assets_current,
              financialDetail.total_assets_1_yr,
              financialDetail.total_assets_2_yr,
              financialDetail.total_assets_3_yr,
              financialDetail.total_assets_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={4}
          />
          <FinancialChartsGridChart
            title="Total Liabilities"
            chartData={createChartData(
              financialDetail.total_liabilities_current,
              financialDetail.total_liabilities_1_yr,
              financialDetail.total_liabilities_2_yr,
              financialDetail.total_liabilities_3_yr,
              financialDetail.total_liabilities_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={5}
          />
          <FinancialChartsGridChart
            title="Operating Cash Flow"
            chartData={createChartData(
              financialDetail.operating_cash_flow_current,
              financialDetail.operating_cash_flow_1_yr,
              financialDetail.operating_cash_flow_2_yr,
              financialDetail.operating_cash_flow_3_yr,
              financialDetail.operating_cash_flow_4_yr,
            )}
            currencyCode={tickerDetail.currency_code}
            colorIndex={6}
          />
        </Box>
      </Padding>
    </Scrollable>
  );
}
