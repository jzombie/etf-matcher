import React, { useCallback, useEffect } from "react";

import {
  CircularProgress,
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

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";
import useTickerVectorQuery, {
  TickerVectorQueryProps,
} from "@hooks/useTickerVectorQuery";

import type { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerVectorQueryTableEuclideanProps = {
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
};

export default function TickerVectorQueryTableEuclidean({
  queryMode,
  query,
}: TickerVectorQueryTableEuclideanProps) {
  const navigateToSymbol = useTickerSymbolNavigation();

  const handleRowClick = useCallback(
    (tickerSymbol: string) => {
      navigateToSymbol(tickerSymbol);
    },
    [navigateToSymbol],
  );

  const {
    isLoadingEuclidean: isLoading,
    fetchEuclidean,
    resultsEuclidean: tickerDetails,
  } = useTickerVectorQuery({
    queryMode,
    query,
  });

  // Auto-fetch
  useEffect(() => {
    if (query && fetchEuclidean) {
      fetchEuclidean();
    }
  }, [fetchEuclidean, query]);

  if (isLoading) {
    return (
      <Center>
        <CircularProgress />
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
              ETF
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Held in ETF
            </TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
              Euclidean Distance
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
                  {detail.is_etf ? "Yes" : "No"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {detail.is_held_in_etf ? "Yes" : "No"}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {detail.distance.toFixed(2)}{" "}
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
