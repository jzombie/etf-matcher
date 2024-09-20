import React, { useMemo } from "react";

import { Box, Typography } from "@mui/material";

import type { TickerBucket, TickerBucketTicker } from "@src/store";

import MergeTable from "./MergeTable";

export type TickerDiff = {
  quantity: number;
  previousQuantity?: number;
  ticker: TickerBucketTicker;
};

// Merge diff component to show what will be added, updated, or unchanged
export type TickerBucketMergeDiffProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
};

export default function TickerBucketMergeDiff({
  currentBucket,
  incomingBucket,
}: TickerBucketMergeDiffProps) {
  // TODO: Refactor
  // TODO: Rename to something besides `mergeResult`
  // Hardcoded merge algorithm inside this component for simplicity
  const mergeResult = useMemo(() => {
    const currentTickersMap = new Map<number, TickerBucketTicker>(
      currentBucket?.tickers.map((ticker) => [ticker.tickerId, ticker]) || [],
    );

    const result = {
      added: [] as TickerDiff[],
      updated: [] as TickerDiff[],
      unchanged: [] as TickerDiff[],
    };

    for (const incomingTicker of incomingBucket.tickers) {
      const existingTicker = currentTickersMap.get(incomingTicker.tickerId);
      if (!existingTicker) {
        // Ticker is new, will be added
        result.added.push({
          quantity: incomingTicker.quantity,
          ticker: incomingTicker,
        });
      } else if (existingTicker.quantity !== incomingTicker.quantity) {
        // Ticker exists but quantity is different, will be updated
        result.updated.push({
          quantity: incomingTicker.quantity,
          previousQuantity: existingTicker.quantity,
          ticker: incomingTicker,
        });
      } else {
        // Ticker exists and quantity is unchanged
        result.unchanged.push({
          quantity: incomingTicker.quantity,
          ticker: incomingTicker,
        });
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
          <MergeTable tickerDiffs={mergeResult.added} actionType="added" />
        </Box>
      )}

      {/* Updated tickers */}
      {mergeResult.updated.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="secondary">
            Updated Tickers:
          </Typography>
          <MergeTable tickerDiffs={mergeResult.updated} actionType="updated" />
        </Box>
      )}

      {/* Unchanged tickers */}
      {mergeResult.unchanged.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="textSecondary">
            Unchanged Tickers:
          </Typography>
          <MergeTable
            tickerDiffs={mergeResult.unchanged}
            actionType="unchanged"
          />
        </Box>
      )}
    </Box>
  );
}
