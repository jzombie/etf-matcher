import React from "react";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

// Component to display the ticker table, color-coded by action type (added, updated, unchanged)
export type MergeTableProps = {
  tickers: TickerBucketTicker[];
  actionType: "added" | "updated" | "unchanged";
};

export default function MergeTable({ tickers, actionType }: MergeTableProps) {
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Exchange</TableCell>
            <TableCell>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickers.map((ticker) => (
            <TableRow key={ticker.tickerId} style={getRowStyle(actionType)}>
              <TableCell>{ticker.symbol}</TableCell>
              <TableCell>{ticker.exchangeShortName || "N/A"}</TableCell>
              <TableCell>{formatNumberWithCommas(ticker.quantity)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {actionType !== "unchanged" && (
        <Box mt={2} display="flex" justifyContent="space-between">
          {/* Merge Button */}
          <Button
            variant="contained"
            color="primary"
            // TODO: Handle
            // onClick={handleMerge}
            // disabled={!selectedFilename}
          >
            Merge Selected Set
          </Button>

          {/* Overwrite Button */}
          <Button
            variant="contained"
            color="secondary"
            // TODO: Handle
            // onClick={handleOverwrite}
            // disabled={!selectedFilename}
          >
            Overwrite with Selected Set
          </Button>
        </Box>
      )}
    </>
  );
}

// Helper function to return different styles based on the action type (added/updated/unchanged)
function getRowStyle(actionType: "added" | "updated" | "unchanged") {
  switch (actionType) {
    case "added":
      return { backgroundColor: "rgba(0, 255, 0, 0.2)" }; // Light green for added
    case "updated":
      return { backgroundColor: "rgba(255, 255, 0, 0.2)" }; // Light yellow for updated
    case "unchanged":
      return { backgroundColor: "rgba(200, 200, 200, 0.2)" }; // Light gray for unchanged
    default:
      return {};
  }
}
