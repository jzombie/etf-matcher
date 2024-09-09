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

import AvatarLogo from "@components/AvatarLogo";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";
import useTickerVectorQuery, {
  TickerVectorQueryProps,
} from "@hooks/useTickerVectorQuery";

import type { RustServiceTickerDetail } from "@utils/callRustService";

import FormattedETFExpenseRatio from "./TickerVectorQueryTable.FormattedETFExpenseRatio";

export type TickerVectorQueryTableCosineProps = {
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
};

export default function TickerVectorQueryTableCosine({
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
    queryMode,
    query,
  });

  // Auto-fetch
  useEffect(() => {
    if (query && fetchCosine) {
      fetchCosine();
    }
  }, [fetchCosine, query]);

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
