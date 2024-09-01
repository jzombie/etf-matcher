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

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import { fetchETFHoldingWeight } from "@utils/callRustService";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@utils/callRustService";
import formatCurrency from "@utils/formatCurrency";

export type ETFHolderProps = {
  etfAggregateDetail: RustServiceETFAggregateDetail;
  holdingTickerDetail: RustServiceTickerDetail;
};

export default function ETFHolder({
  etfAggregateDetail,
  holdingTickerDetail,
}: ETFHolderProps) {
  const [holdingPercentage, setHoldingPercentage] = useState<number | null>(
    null,
  );
  const [holdingMarketValue, setHoldingMarketValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const etfTickerId = etfAggregateDetail.ticker_id;
    const holdingTickerId = holdingTickerDetail.ticker_id;

    fetchETFHoldingWeight(etfTickerId, holdingTickerId).then((resp) => {
      setHoldingPercentage(resp.holding_percentage);
      setHoldingMarketValue(resp.holding_market_value);
    });
  }, [etfAggregateDetail, holdingTickerDetail]);

  const renderDetail = (label: string, value: string | number | null) => (
    <TableCell>{value !== null ? value : "N/A"}</TableCell>
  );

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <Box sx={{ paddingBottom: 2 }}>
      <ButtonBase
        onClick={() => {
          navigateToSymbol(etfAggregateDetail.etf_symbol);
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
        </Paper>
      </ButtonBase>
    </Box>
  );
}
