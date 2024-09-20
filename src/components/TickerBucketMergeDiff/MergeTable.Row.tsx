import React from "react";

import { TableCell, TableRow, Typography } from "@mui/material";

import AvatarLogo from "@components/AvatarLogo";

import useTickerDetail from "@hooks/useTickerDetail";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

import type { MergeTableProps } from "./MergeTable";
import type { TickerDiff } from "./TickerBucketMergeDiff";

export type MergeTableRowProps = {
  tickerDiff: TickerDiff;
  actionType: MergeTableProps["actionType"];
};

export default function MergeTableRow({
  tickerDiff,
  actionType,
}: MergeTableRowProps) {
  const { tickerDetail } = useTickerDetail(tickerDiff.ticker.tickerId);

  // Calculate the change in quantity
  const quantityChange =
    tickerDiff.previousQuantity !== undefined
      ? tickerDiff.ticker.quantity - tickerDiff.previousQuantity
      : null; // No change for new tickers

  return (
    <TableRow key={tickerDiff.ticker.tickerId} style={getRowStyle(actionType)}>
      <TableCell>
        <AvatarLogo tickerDetail={tickerDetail} />
      </TableCell>
      <TableCell>
        {tickerDiff.ticker.symbol}
        {tickerDiff.ticker.exchangeShortName
          ? ` (${tickerDiff.ticker.exchangeShortName})`
          : ""}
      </TableCell>
      <TableCell>{tickerDetail?.company_name || "N/A"}</TableCell>
      <TableCell>
        {formatNumberWithCommas(tickerDiff.ticker.quantity)}
        {quantityChange !== null && (
          <>
            <br />
            <Typography
              component="span"
              color={quantityChange > 0 ? "green" : "red"}
              sx={{ marginLeft: 1 }}
            >
              {quantityChange > 0
                ? `(+${formatNumberWithCommas(quantityChange)})`
                : `(${formatNumberWithCommas(quantityChange)})`}
            </Typography>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

// Helper function to return different styles based on the action type (added/updated/unchanged)
function getRowStyle(actionType: "added" | "updated" | "unchanged") {
  switch (actionType) {
    case "added":
      return { backgroundColor: "rgba(0, 255, 0, 0.2)" }; // Light green for added
    case "updated":
      return { backgroundColor: "rgba(255, 255, 0, 0.05)" }; // Light yellow for updated
    case "unchanged":
      return { backgroundColor: "rgba(200, 200, 200, 0.2)" }; // Light gray for unchanged
    default:
      return {};
  }
}
