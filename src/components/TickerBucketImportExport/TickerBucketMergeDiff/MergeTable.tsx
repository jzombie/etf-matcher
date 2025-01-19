import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import MergeTableRow from "./MergeTable.Row";
import type {
  TickerBucketChangeActionTypes,
  TickerDiff,
} from "./hooks/useBucketChangeOverview";

// Component to display the ticker table, color-coded by action type (added, updated, unchanged)
export type MergeTableProps = {
  tickerDiffs: TickerDiff[];
  actionType: TickerBucketChangeActionTypes;
};

export default function MergeTable({
  tickerDiffs,
  actionType,
}: MergeTableProps) {
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{/* Logo */}</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickerDiffs.map((tickerDiff) => (
            <MergeTableRow
              key={tickerDiff.ticker.symbol}
              tickerDiff={tickerDiff}
              actionType={actionType}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}
