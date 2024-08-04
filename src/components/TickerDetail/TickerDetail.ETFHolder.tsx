import React, { useEffect, useState } from "react";

import {
  Box,
  ButtonBase,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import store from "@src/store";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@src/types";

import TickerContainer from "@components/TickerContainer";

import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";
import formatCurrency from "@utils/formatCurrency";

export type ETFHolderProps = {
  etfAggregateDetail: RustServiceETFAggregateDetail;
  holdingTickerDetail: RustServiceTickerDetail;
};

export default function ETFHolder({
  etfAggregateDetail,
  holdingTickerDetail,
}: ETFHolderProps) {
  const { setURLState } = useURLState();

  const [holdingPercentage, setHoldingPercentage] = useState<number | null>(
    null,
  );
  const [holdingMarketValue, setHoldingMarketValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const etfTickerId = etfAggregateDetail.ticker_id;
    const holdingTickerId = holdingTickerDetail.ticker_id;

    customLogger.warn("TODO: Add typings for `fetchETFHoldingWeight`");

    store
      .PROTO_fetchETFHoldingWeight(etfTickerId, holdingTickerId)
      .then((resp) => {
        // @ts-expect-error TODO: Add typings
        setHoldingPercentage(resp.holding_percentage);
        // @ts-expect-error TODO: Add typings
        setHoldingMarketValue(resp.holding_market_value);
      });
  }, [etfAggregateDetail, holdingTickerDetail]);

  const renderDetail = (label: string, value: string | number | null) => (
    <Typography variant="body2" gutterBottom>
      {label}: {value ? value : "N/A"}
    </Typography>
  );

  return (
    <TickerContainer tickerId={etfAggregateDetail.ticker_id}>
      <Box sx={{ paddingBottom: 2 }}>
        <ButtonBase
          onClick={() => {
            setURLState(
              {
                query: etfAggregateDetail.etf_symbol,
              },
              false,
              "/search",
            );
          }}
          sx={{ display: "block", width: "100%", textAlign: "left" }}
        >
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              {etfAggregateDetail.etf_name} ({etfAggregateDetail.etf_symbol})
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  Top Sector Information
                </Typography>
                {renderDetail(
                  "Top Sector Market Value",
                  etfAggregateDetail.top_sector_market_value
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.top_sector_market_value,
                      )
                    : null,
                )}
                {renderDetail(
                  "Top Market Value Industry",
                  etfAggregateDetail?.top_market_value_industry_name || "N/A",
                )}
                {renderDetail(
                  "Top Market Value Sector",
                  etfAggregateDetail?.top_market_value_sector_name || "N/A",
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  Holding Information
                </Typography>
                {renderDetail(
                  `${holdingTickerDetail.symbol} Holding Percentage`,
                  holdingPercentage ? `${holdingPercentage.toFixed(2)}%` : null,
                )}
                {renderDetail(
                  `${holdingTickerDetail.symbol} Holding Market Value`,
                  holdingMarketValue
                    ? formatCurrency(
                        etfAggregateDetail.currency_code, // TODO: Should be set to the currency code of the holding itself
                        holdingMarketValue,
                      )
                    : null,
                )}
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              Financial Averages (Latest)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Latest Revenue",
                  etfAggregateDetail.avg_latest_revenue
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_revenue,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Gross Profit",
                  etfAggregateDetail.avg_latest_gross_profit
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_gross_profit,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Operating Income",
                  etfAggregateDetail.avg_latest_operating_income
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_operating_income,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Net Income",
                  etfAggregateDetail.avg_latest_net_income
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_net_income,
                      )
                    : null,
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Latest Total Assets",
                  etfAggregateDetail.avg_latest_total_assets
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_total_assets,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Total Liabilities",
                  etfAggregateDetail.avg_latest_total_liabilities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_total_liabilities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Total Stockholders' Equity",
                  etfAggregateDetail.avg_latest_total_stockholders_equity
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_total_stockholders_equity,
                      )
                    : null,
                )}
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              Financial Averages (Previous)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Previous Revenue",
                  etfAggregateDetail.avg_previous_revenue
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_revenue,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Gross Profit",
                  etfAggregateDetail.avg_previous_gross_profit
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_gross_profit,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Operating Income",
                  etfAggregateDetail.avg_previous_operating_income
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_operating_income,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Net Income",
                  etfAggregateDetail.avg_previous_net_income
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_net_income,
                      )
                    : null,
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Previous Total Assets",
                  etfAggregateDetail.avg_previous_total_assets
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_total_assets,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Total Liabilities",
                  etfAggregateDetail.avg_previous_total_liabilities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_total_liabilities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Total Stockholders' Equity",
                  etfAggregateDetail.avg_previous_total_stockholders_equity
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_total_stockholders_equity,
                      )
                    : null,
                )}
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              Cash Flow Information (Latest)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Latest Operating Cash Flow",
                  etfAggregateDetail.avg_latest_operating_cash_flow
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_operating_cash_flow,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Net Cash Provided by Operating Activities",
                  etfAggregateDetail.avg_latest_net_cash_provided_by_operating_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_net_cash_provided_by_operating_activities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Net Cash Used for Investing Activities",
                  etfAggregateDetail.avg_latest_net_cash_used_for_investing_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_net_cash_used_for_investing_activities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Latest Net Cash Used Provided by Financing Activities",
                  etfAggregateDetail.avg_latest_net_cash_used_provided_by_financing_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_latest_net_cash_used_provided_by_financing_activities,
                      )
                    : null,
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderDetail(
                  "Avg. Previous Operating Cash Flow",
                  etfAggregateDetail.avg_previous_operating_cash_flow
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_operating_cash_flow,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Net Cash Provided by Operating Activities",
                  etfAggregateDetail.avg_previous_net_cash_provided_by_operating_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_net_cash_provided_by_operating_activities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Net Cash Used for Investing Activities",
                  etfAggregateDetail.avg_previous_net_cash_used_for_investing_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_net_cash_used_for_investing_activities,
                      )
                    : null,
                )}
                {renderDetail(
                  "Avg. Previous Net Cash Used Provided by Financing Activities",
                  etfAggregateDetail.avg_previous_net_cash_used_provided_by_financing_activities
                    ? formatCurrency(
                        etfAggregateDetail.currency_code,
                        etfAggregateDetail.avg_previous_net_cash_used_provided_by_financing_activities,
                      )
                    : null,
                )}
              </Grid>
            </Grid>
          </Paper>
        </ButtonBase>
      </Box>
    </TickerContainer>
  );
}
