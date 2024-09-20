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

import MergeTableRow from "./MergeTable.Row";
import type { TickerDiff } from "./TickerBucketMergeDiff";

// Component to display the ticker table, color-coded by action type (added, updated, unchanged)
export type MergeTableProps = {
  tickerDiffs: TickerDiff[];
  actionType: "added" | "updated" | "unchanged";
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
              key={tickerDiff.ticker.tickerId}
              tickerDiff={tickerDiff}
              actionType={actionType}
              // TODO: Add changed quantity
            />
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
