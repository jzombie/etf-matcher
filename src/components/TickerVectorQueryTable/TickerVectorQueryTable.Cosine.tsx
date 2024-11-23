import React, { useCallback, useEffect } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import Center from "@layoutKit/Center";
import type { RustServiceTickerDetail } from "@services/RustService";

import AvatarLogo from "@components/AvatarLogo";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";
import useTickerVectorQuery, {
  TickerVectorQueryProps,
} from "@hooks/useTickerVectorQuery";

import FormattedETFExpenseRatio from "./TickerVectorQueryTable.FormattedETFExpenseRatio";

export type TickerVectorQueryTableCosineProps = {
  tickerVectorConfigKey: string;
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
};

export default function TickerVectorQueryTableCosine({
  tickerVectorConfigKey,
  queryMode,
  query,
}: TickerVectorQueryTableCosineProps) {
  const navigateToSymbol = useTickerSymbolNavigation();

  const handleRowClick = useCallback(
    (tickerSymbol: string) => {
      navigateToSymbol(tickerSymbol);
    },
    [navigateToSymbol],
  );

  const {
    isLoadingCosine: isLoading,
    resultsCosine: tickerDetails,
    fetchCosine,
  } = useTickerVectorQuery({
    tickerVectorConfigKey,
    queryMode,
    query,
  });

  // Auto-fetch
  useEffect(() => {
    // Note: `tickerVectorConfigKey` is used here ensure this refetches when it
    // changes
    if (tickerVectorConfigKey && query && fetchCosine) {
      fetchCosine();
    }
  }, [tickerVectorConfigKey, fetchCosine, query]);

  if (isLoading) {
    return (
      <Center>
        <NetworkProgressIndicator />
      </Center>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Company Name</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Industry
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Sector
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              ETF Expense Ratio
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Held in ETF
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              {
                // TODO: Prefix with proper type
              }
              Cosine Similarity
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickerDetails && tickerDetails.length > 0 ? (
            tickerDetails.map((detail) => (
              <TableRow
                key={detail.ticker_id}
                onClick={() => handleRowClick(detail.symbol)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                  <AvatarLogo
                    tickerDetail={detail as RustServiceTickerDetail}
                  />
                  <br />
                  {detail.symbol}
                </TableCell>
                <TableCell>{detail.company_name}</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {detail.industry_name || "N/A"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {detail.sector_name || "N/A"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <FormattedETFExpenseRatio tickerDetail={detail} />
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {detail.is_held_in_etf ? "Yes" : "No"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {detail.cosineSimilarityScore.toFixed(2)}{" "}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography>No details available</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
