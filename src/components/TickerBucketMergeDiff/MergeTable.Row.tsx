import React from "react";

import { TableCell, TableRow } from "@mui/material";

import type { TickerBucketTicker } from "@src/store";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

import type { MergeTableProps } from "./MergeTable";

export type MergeTableRowProps = {
  ticker: TickerBucketTicker;
  actionType: MergeTableProps["actionType"];
};

export default function MergeTableRow({
  ticker,
  actionType,
}: MergeTableRowProps) {
  return (
    <TableRow key={ticker.tickerId} style={getRowStyle(actionType)}>
      <TableCell>{ticker.symbol}</TableCell>
      <TableCell>{ticker.exchangeShortName || "N/A"}</TableCell>
      <TableCell>{formatNumberWithCommas(ticker.quantity)}</TableCell>
    </TableRow>
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
