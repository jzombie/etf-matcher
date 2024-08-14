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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isLoading || !detail) {
    return <div>Loading...</div>;
  }

  const getField = (
    label: string,
    value: number | undefined,
    isCurrency: boolean = true,
  ) => (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {label}
      </Typography>
      <Typography variant="body2">
        {value !== undefined
          ? isCurrency
            ? formatCurrency(
                isETFAggregateDetail(detail) ? detail.currency_code : "USD",
                value,
              )
            : value
          : "N/A"}
      </Typography>
    </Box>
  );

  const renderFieldGroup = (
    label: string,
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

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)",
          gap: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ gridColumn: "1 / -1" }}>
          {label}
        </Typography>
        {typeof current === "number" && getField("Current", current, true)}
        {typeof year1 === "number" && getField("1 Year Ago", year1, true)}
        {typeof year2 === "number" && getField("2 Years Ago", year2, true)}
        {typeof year3 === "number" && getField("3 Years Ago", year3, true)}
        {typeof year4 === "number" && getField("4 Years Ago", year4, true)}
      </Box>
    );
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Financial Overview
      </Typography>
      {renderFieldGroup(
        "Revenue",
        isETF ? "avg_revenue_current" : "revenue_current",
        isETF ? "avg_revenue_1_yr" : "revenue_1_yr",
        isETF ? "avg_revenue_2_yr" : "revenue_2_yr",
        isETF ? "avg_revenue_3_yr" : "revenue_3_yr",
        isETF ? "avg_revenue_4_yr" : "revenue_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
        "Gross Profit",
        isETF ? "avg_gross_profit_current" : "gross_profit_current",
        isETF ? "avg_gross_profit_1_yr" : "gross_profit_1_yr",
        isETF ? "avg_gross_profit_2_yr" : "gross_profit_2_yr",
        isETF ? "avg_gross_profit_3_yr" : "gross_profit_3_yr",
        isETF ? "avg_gross_profit_4_yr" : "gross_profit_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
        "Operating Income",
        isETF ? "avg_operating_income_current" : "operating_income_current",
        isETF ? "avg_operating_income_1_yr" : "operating_income_1_yr",
        isETF ? "avg_operating_income_2_yr" : "operating_income_2_yr",
        isETF ? "avg_operating_income_3_yr" : "operating_income_3_yr",
        isETF ? "avg_operating_income_4_yr" : "operating_income_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
        "Net Income",
        isETF ? "avg_net_income_current" : "net_income_current",
        isETF ? "avg_net_income_1_yr" : "net_income_1_yr",
        isETF ? "avg_net_income_2_yr" : "net_income_2_yr",
        isETF ? "avg_net_income_3_yr" : "net_income_3_yr",
        isETF ? "avg_net_income_4_yr" : "net_income_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
        "Total Assets",
        isETF ? "avg_total_assets_current" : "total_assets_current",
        isETF ? "avg_total_assets_1_yr" : "total_assets_1_yr",
        isETF ? "avg_total_assets_2_yr" : "total_assets_2_yr",
        isETF ? "avg_total_assets_3_yr" : "total_assets_3_yr",
        isETF ? "avg_total_assets_4_yr" : "total_assets_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
        "Total Liabilities",
        isETF ? "avg_total_liabilities_current" : "total_liabilities_current",
        isETF ? "avg_total_liabilities_1_yr" : "total_liabilities_1_yr",
        isETF ? "avg_total_liabilities_2_yr" : "total_liabilities_2_yr",
        isETF ? "avg_total_liabilities_3_yr" : "total_liabilities_3_yr",
        isETF ? "avg_total_liabilities_4_yr" : "total_liabilities_4_yr",
      )}
      <Divider sx={{ my: 2 }} />
      {renderFieldGroup(
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
