import React, { useCallback, useEffect, useState } from "react";

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

import Padding from "@layoutKit/Padding";

import FakeButton from "@components/FakeButton";

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

  const renderDetail = useCallback(
    (label: string, value: string | number | null) => (
      <>
        <TableCell sx={{ width: "50%", whiteSpace: "nowrap" }}>
          {label}
        </TableCell>
        <TableCell sx={{ width: "50%", whiteSpace: "nowrap" }}>
          {value !== null ? value : "N/A"}
        </TableCell>
      </>
    ),
    [],
  );

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <Padding>
      <ButtonBase
        onClick={() => {
          navigateToSymbol(etfAggregateDetail.etf_symbol);
        }}
        sx={{ display: "block", width: "100%", textAlign: "left" }}
      >
        <Box sx={{ overflow: "auto" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", marginBottom: 1, float: "left" }}
          >
            {etfAggregateDetail.etf_name} ({etfAggregateDetail.etf_symbol})
          </Typography>
          {
            // `FakeButton` is used to not nest button within a button
          }
          <FakeButton
            onClick={() => {
              navigateToSymbol(etfAggregateDetail.etf_symbol);
            }}
            sx={{ float: "right" }}
          >
            View
          </FakeButton>
        </Box>
        <Divider sx={{ marginBottom: 2 }} />

        <TableContainer component={Paper}>
          <Table aria-label="etf details">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "50%" }}>Detail</TableCell>
                <TableCell sx={{ width: "50%" }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {renderDetail(
                  "Expense Ratio",
                  etfAggregateDetail.expense_ratio
                    ? `${etfAggregateDetail.expense_ratio.toFixed(2)}%`
                    : null,
                )}
              </TableRow>
              <TableRow>
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
                {renderDetail(
                  "Top Market Value Industry",
                  etfAggregateDetail?.top_market_value_industry_name || "N/A",
                )}
              </TableRow>
              <TableRow>
                {renderDetail(
                  "Top Market Value Sector",
                  etfAggregateDetail?.top_market_value_sector_name || "N/A",
                )}
              </TableRow>
              <TableRow>
                {renderDetail(
                  `${holdingTickerDetail.symbol} Holding Percentage`,
                  holdingPercentage !== null
                    ? `${holdingPercentage.toFixed(2)}%`
                    : null,
                )}
              </TableRow>
              <TableRow>
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
      </ButtonBase>
    </Padding>
  );
}
