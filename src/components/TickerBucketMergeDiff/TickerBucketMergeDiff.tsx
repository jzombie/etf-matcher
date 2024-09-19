import React, { useMemo } from "react";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

// Merge diff component to show what will be added, updated, or unchanged
export type TickerBucketMergeDiffProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
};

export default function TickerBucketMergeDiff({
  currentBucket,
  incomingBucket,
}: TickerBucketMergeDiffProps) {
  // Hardcoded merge algorithm inside this component for simplicity
  const mergeResult = useMemo(() => {
    const currentTickersMap = new Map<number, TickerBucketTicker>(
      currentBucket?.tickers.map((ticker) => [ticker.tickerId, ticker]) || [],
    );

    const result = {
      added: [] as TickerBucketTicker[],
      updated: [] as TickerBucketTicker[],
      unchanged: [] as TickerBucketTicker[],
    };

    for (const incomingTicker of incomingBucket.tickers) {
      const existingTicker = currentTickersMap.get(incomingTicker.tickerId);
      if (!existingTicker) {
        // Ticker is new, will be added
        result.added.push(incomingTicker);
      } else if (existingTicker.quantity !== incomingTicker.quantity) {
        // Ticker exists but quantity is different, will be updated
        result.updated.push(incomingTicker);
      } else {
        // Ticker exists and quantity is unchanged
        result.unchanged.push(incomingTicker);
      }
    }

    return result;
  }, [currentBucket, incomingBucket]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {currentBucket ? (
          <>Merge diff &quot;{incomingBucket.name}&quot;</>
        ) : (
          <>Add &quot;{incomingBucket.name}&quot;</>
        )}
      </Typography>

      {/* Added tickers */}
      {mergeResult.added.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="primary">
            Added Tickers:
          </Typography>
          <MergeTable tickers={mergeResult.added} actionType="added" />
        </Box>
      )}

      {/* Updated tickers */}
      {mergeResult.updated.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="secondary">
            Updated Tickers:
          </Typography>
          <MergeTable tickers={mergeResult.updated} actionType="updated" />
        </Box>
      )}

      {/* Unchanged tickers */}
      {mergeResult.unchanged.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="textSecondary">
            Unchanged Tickers:
          </Typography>
          <MergeTable tickers={mergeResult.unchanged} actionType="unchanged" />
        </Box>
      )}
    </Box>
  );
}

// Component to display the ticker table, color-coded by action type (added, updated, unchanged)
type MergeTableProps = {
  tickers: TickerBucketTicker[];
  actionType: "added" | "updated" | "unchanged";
};

function MergeTable({ tickers, actionType }: MergeTableProps) {
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            {
              // TODO: Remove?
              // <TableCell>Ticker ID</TableCell>
            }
            <TableCell>Symbol</TableCell>
            <TableCell>Exchange</TableCell>
            <TableCell>Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickers.map((ticker) => (
            <TableRow key={ticker.tickerId} style={getRowStyle(actionType)}>
              {
                // TODO: Remove?
                // <TableCell>{ticker.tickerId}</TableCell>
              }
              <TableCell>{ticker.symbol}</TableCell>
              <TableCell>{ticker.exchangeShortName || "N/A"}</TableCell>
              <TableCell>{ticker.quantity}</TableCell>
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
            // onClick={handleMerge}
            // disabled={!selectedSetFilename}
          >
            Merge Selected Set
          </Button>

          {/* Overwrite Button */}
          <Button
            variant="contained"
            color="secondary"
            // onClick={handleOverwrite}
            // disabled={!selectedSetFilename}
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
