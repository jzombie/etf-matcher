import React, { useMemo } from "react";

import { Box, Typography } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import MergeTable from "./MergeTable";

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
