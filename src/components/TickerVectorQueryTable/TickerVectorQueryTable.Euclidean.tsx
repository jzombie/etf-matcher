import React, { useCallback, useEffect } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import type { RustServiceTickerDetail } from "@services/RustService";

import AvatarLogo from "@components/AvatarLogo";
import NetworkProgressIndicator from "@components/NetworkProgressIndicator";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";
import useTickerVectorQuery, {
  TickerVectorQueryProps,
} from "@hooks/useTickerVectorQuery";

import FormattedETFExpenseRatio from "./TickerVectorQueryTable.FormattedETFExpenseRatio";

export type TickerVectorQueryTableEuclideanProps = {
  tickerVectorConfigKey: string;
  queryMode: TickerVectorQueryProps["queryMode"];
  query: TickerVectorQueryProps["query"];
};

export default function TickerVectorQueryTableEuclidean({
  tickerVectorConfigKey,
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
    tickerVectorConfigKey,
    queryMode,
    query,
  });

  // Auto-fetch
  useEffect(() => {
    // Note: `tickerVectorConfigKey` is used here ensure this refetches when it
    // changes
    if (tickerVectorConfigKey && query && fetchEuclidean) {
      fetchEuclidean();
    }
  }, [tickerVectorConfigKey, fetchEuclidean, query]);

  return (
    <Full>
      <TableContainer component={Paper}>
        {(tickerDetails || !isLoading) && (
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
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      {detail.industry_name || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      {detail.sector_name || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      <FormattedETFExpenseRatio tickerDetail={detail} />
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      {detail.is_held_in_etf ? "Yes" : "No"}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      {detail.distance.toFixed(2)}{" "}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <NoInformationAvailableAlert>
                      No details available
                    </NoInformationAvailableAlert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <Cover clickThrough>
        {isLoading && (
          <Center>
            <NetworkProgressIndicator />
          </Center>
        )}
      </Cover>
    </Full>
  );
}
