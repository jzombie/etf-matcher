import React, { useCallback, useEffect, useState } from "react";

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

import store from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import EncodedImage from "@components/EncodedImage";

import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";

export type TickerVectorWithDistance = RustServiceTickerDetail & {
  distance: number;
};

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  const [tickerDetails, setTickerDetails] = useState<
    TickerVectorWithDistance[] | null
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
      store
        .fetchClosestTickers(tickerId)
        .then(async (closestTickers) => {
          const detailPromises = closestTickers.map((item) =>
            store.fetchTickerDetail(item.ticker_id).then((detail) => ({
              ...detail,
              distance: item.distance,
            })),
          );
          const settledDetails = await Promise.allSettled(detailPromises);

          const fulfilledDetails = settledDetails
            .filter((result) => result.status === "fulfilled")
            .map(
              (result) =>
                (result as PromiseFulfilledResult<TickerVectorWithDistance>)
                  .value,
            );

          setTickerDetails(fulfilledDetails);
          customLogger.log({ fulfilledDetails, closestTickers });
        })
        .catch((error) => {
          customLogger.error("Error fetching closest tickers:", error);
        });
    }
  }, [tickerId]);

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
              Euclidian Distance
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
                  {
                    // TODO: Use same avatar-like styling as in `SettingsManager`
                  }
                  <EncodedImage
                    encSrc={detail.logo_filename}
                    style={{ width: 50 }}
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
