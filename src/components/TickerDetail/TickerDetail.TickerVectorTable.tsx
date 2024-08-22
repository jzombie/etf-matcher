import React, { useEffect, useState } from "react";

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

import customLogger from "@utils/customLogger";

export type TickerVectorTableProps = {
  tickerId: number;
};

export default function TickerVectorTable({
  tickerId,
}: TickerVectorTableProps) {
  const [tickerDetails, setTickerDetails] = useState<
    RustServiceTickerDetail[] | null
  >(null);

  useEffect(() => {
    if (tickerId) {
      store.fetchClosestTickers(tickerId).then(async (closestTickers) => {
        const detailPromises = closestTickers.map((item) =>
          store.fetchTickerDetail(item.ticker_id),
        );
        const settledDetails = await Promise.allSettled(detailPromises);

        // Extract only the fulfilled promises
        const fulfilledDetails = settledDetails
          .filter((result) => result.status === "fulfilled")
          .map(
            (result) =>
              (result as PromiseFulfilledResult<RustServiceTickerDetail>).value,
          );

        // Set the fulfilled details in state
        setTickerDetails(fulfilledDetails);

        // Optional: log details
        customLogger.log({ fulfilledDetails, closestTickers });
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
            <TableCell>Exchange</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Industry</TableCell>
            <TableCell>Sector</TableCell>
            <TableCell>Score Avg DCA</TableCell>
            <TableCell>ETF</TableCell>
            <TableCell>Held in ETF</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickerDetails && tickerDetails.length > 0 ? (
            tickerDetails.map((detail) => (
              <TableRow key={detail.ticker_id}>
                <TableCell>{detail.symbol}</TableCell>
                <TableCell>{detail.company_name}</TableCell>
                <TableCell>{detail.exchange_short_name || "N/A"}</TableCell>
                <TableCell>{detail.country_code}</TableCell>
                <TableCell>{detail.industry_name || "N/A"}</TableCell>
                <TableCell>{detail.sector_name || "N/A"}</TableCell>
                <TableCell>{detail.score_avg_dca}</TableCell>
                <TableCell>{detail.is_etf ? "Yes" : "No"}</TableCell>
                <TableCell>{detail.is_held_in_etf ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9}>
                <Typography>No details available</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
