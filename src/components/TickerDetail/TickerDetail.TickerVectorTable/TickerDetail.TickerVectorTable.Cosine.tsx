import React, { useCallback, useEffect, useState } from "react";

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
import store from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import AvatarLogo from "@components/AvatarLogo";

import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";

export type TickerVectorWithCosineSimilarityScore = RustServiceTickerDetail & {
  cosineSimilarityScore: number;
};

export type TickerVectorTableCosineProps = {
  tickerId: number;
};

export default function TickerVectorTableCosine({
  tickerId,
}: TickerVectorTableCosineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tickerDetails, setTickerDetails] = useState<
    TickerVectorWithCosineSimilarityScore[] | null
  >(null);

  const { setURLState, toBooleanParam } = useURLState();

  const handleRowClick = useCallback(
    (tickerSymbol: string) => {
      setURLState(
        {
          query: tickerSymbol,
          exact: toBooleanParam(true),
        },
        false,
        "/search",
      );
    },
    [setURLState, toBooleanParam],
  );

  useEffect(() => {
    if (tickerId) {
      setIsLoading(true);

      store
        .fetchRankedTickersByCosineSimilarity(tickerId)
        .then(async (similarTickers) => {
          const detailPromises = similarTickers.map((item) =>
            store.fetchTickerDetail(item.ticker_id).then((detail) => ({
              ...detail,
              cosineSimilarityScore: item.similarity_score,
            })),
          );
          const settledDetails = await Promise.allSettled(detailPromises);

          const fulfilledDetails = settledDetails
            .filter((result) => result.status === "fulfilled")
            .map(
              (result) =>
                (
                  result as PromiseFulfilledResult<TickerVectorWithCosineSimilarityScore>
                ).value,
            );

          setTickerDetails(fulfilledDetails);
        })
        .catch((error) => {
          customLogger.error("Error fetching similar tickers:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [tickerId]);

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
                  {detail.is_etf ? "Yes" : "No"}
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
