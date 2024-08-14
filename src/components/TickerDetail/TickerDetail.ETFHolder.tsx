import React, { useEffect, useState } from "react";

import {
  Box,
  ButtonBase,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import store from "@src/store";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@src/types";

import useURLState from "@hooks/useURLState";

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

    store.fetchETFHoldingWeight(etfTickerId, holdingTickerId).then((resp) => {
      setHoldingPercentage(resp.holding_percentage);
      setHoldingMarketValue(resp.holding_market_value);
    });
  }, [etfAggregateDetail, holdingTickerDetail]);

  const renderDetail = (label: string, value: string | number | null) => (
    <TableCell>{value !== null ? value : "N/A"}</TableCell>
  );

  return (
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

          <TableContainer component={Paper}>
            <Table aria-label="etf details">
              <TableHead>
                <TableRow>
                  <TableCell>Detail</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Top Sector Market Value</TableCell>
                  {renderDetail(
                    "Top Sector Market Value",
                    etfAggregateDetail.top_sector_market_value
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.top_sector_market_value,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Top Market Value Industry</TableCell>
                  {renderDetail(
                    "Top Market Value Industry",
                    etfAggregateDetail?.top_market_value_industry_name || "N/A",
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Top Market Value Sector</TableCell>
                  {renderDetail(
                    "Top Market Value Sector",
                    etfAggregateDetail?.top_market_value_sector_name || "N/A",
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    {holdingTickerDetail.symbol} Holding Percentage
                  </TableCell>
                  {renderDetail(
                    `${holdingTickerDetail.symbol} Holding Percentage`,
                    holdingPercentage !== null
                      ? `${holdingPercentage.toFixed(2)}%`
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    {holdingTickerDetail.symbol} Holding Market Value
                  </TableCell>
                  {renderDetail(
                    `${holdingTickerDetail.symbol} Holding Market Value`,
                    holdingMarketValue
                      ? formatCurrency(
                          etfAggregateDetail.currency_code, // TODO: Should be set to the currency code of the holding itself
                          holdingMarketValue,
                        )
                      : null,
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ marginY: 2 }} />

          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            Financial Averages (Latest)
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="financial averages latest">
              <TableHead>
                <TableRow>
                  <TableCell>Detail</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Avg. Latest Revenue</TableCell>
                  {renderDetail(
                    "Avg. Latest Revenue",
                    etfAggregateDetail.avg_revenue_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_revenue_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Latest Gross Profit</TableCell>
                  {renderDetail(
                    "Avg. Latest Gross Profit",
                    etfAggregateDetail.avg_gross_profit_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_gross_profit_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Latest Operating Income</TableCell>
                  {renderDetail(
                    "Avg. Latest Operating Income",
                    etfAggregateDetail.avg_operating_income_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_operating_income_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Latest Net Income</TableCell>
                  {renderDetail(
                    "Avg. Latest Net Income",
                    etfAggregateDetail.avg_net_income_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_income_current,
                        )
                      : null,
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ marginY: 2 }} />

          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            Financial Averages (Previous)
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="financial averages previous">
              <TableHead>
                <TableRow>
                  <TableCell>Detail</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Avg. Previous Revenue</TableCell>
                  {renderDetail(
                    "Avg. Previous Revenue",
                    etfAggregateDetail.avg_revenue_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_revenue_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Previous Gross Profit</TableCell>
                  {renderDetail(
                    "Avg. Previous Gross Profit",
                    etfAggregateDetail.avg_gross_profit_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_gross_profit_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Previous Operating Income</TableCell>
                  {renderDetail(
                    "Avg. Previous Operating Income",
                    etfAggregateDetail.avg_operating_income_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_operating_income_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>Avg. Previous Net Income</TableCell>
                  {renderDetail(
                    "Avg. Previous Net Income",
                    etfAggregateDetail.avg_net_income_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_income_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ marginY: 2 }} />

          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            Cash Flow Information (Latest)
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="cash flow information latest">
              <TableHead>
                <TableRow>
                  <TableCell>Detail</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Avg. Latest Operating Cash Flow</TableCell>
                  {renderDetail(
                    "Avg. Latest Operating Cash Flow",
                    etfAggregateDetail.avg_operating_cash_flow_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_operating_cash_flow_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Latest Net Cash Provided by Operating Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Latest Net Cash Provided by Operating Activities",
                    etfAggregateDetail.avg_net_cash_provided_by_operating_activities_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_provided_by_operating_activities_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Latest Net Cash Used for Investing Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Latest Net Cash Used for Investing Activities",
                    etfAggregateDetail.avg_net_cash_used_for_investing_activities_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_used_for_investing_activities_current,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Latest Net Cash Provided by Financing Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Latest Net Cash Provided by Financing Activities",
                    etfAggregateDetail.avg_net_cash_used_provided_by_financing_activities_current
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_used_provided_by_financing_activities_current,
                        )
                      : null,
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ marginY: 2 }} />

          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: "bold" }}
          >
            Cash Flow Information (Previous)
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="cash flow information previous">
              <TableHead>
                <TableRow>
                  <TableCell>Detail</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Avg. Previous Operating Cash Flow</TableCell>
                  {renderDetail(
                    "Avg. Previous Operating Cash Flow",
                    etfAggregateDetail.avg_operating_cash_flow_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_operating_cash_flow_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Previous Net Cash Provided by Operating Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Previous Net Cash Provided by Operating Activities",
                    etfAggregateDetail.avg_net_cash_provided_by_operating_activities_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_provided_by_operating_activities_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Previous Net Cash Used for Investing Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Previous Net Cash Used for Investing Activities",
                    etfAggregateDetail.avg_net_cash_used_for_investing_activities_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_used_for_investing_activities_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
                <TableRow>
                  <TableCell>
                    Avg. Previous Net Cash Provided by Financing Activities
                  </TableCell>
                  {renderDetail(
                    "Avg. Previous Net Cash Provided by Financing Activities",
                    etfAggregateDetail.avg_net_cash_used_provided_by_financing_activities_1_yr
                      ? formatCurrency(
                          etfAggregateDetail.currency_code,
                          etfAggregateDetail.avg_net_cash_used_provided_by_financing_activities_1_yr,
                        )
                      : null,
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </ButtonBase>
    </Box>
  );
}
