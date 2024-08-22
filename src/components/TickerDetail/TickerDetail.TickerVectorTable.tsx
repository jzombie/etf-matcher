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
  useMediaQuery,
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

  const isMobile = useMediaQuery("(max-width:600px)");

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
          </TableRow>
        </TableHead>
        <TableBody>
          {tickerDetails && tickerDetails.length > 0 ? (
            tickerDetails.map((detail) => (
              <TableRow key={detail.ticker_id}>
                <TableCell>{detail.symbol}</TableCell>
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
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography>No details available</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
