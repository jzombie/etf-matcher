import React from "react";

import { Box, Typography } from "@mui/material";

import type { TickerBucket } from "@src/store";

import MergeTable from "./MergeTable";
import useBucketChangeOverview from "./useBucketChangeOverview";

export type TickerBucketMergeDiffProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
};

// Merge diff component to show what will be added, updated, or unchanged
export default function TickerBucketMergeDiff({
  currentBucket,
  incomingBucket,
}: TickerBucketMergeDiffProps) {
  const bucketChangeOverview = useBucketChangeOverview({
    currentBucket,
    incomingBucket,
  });

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
      {bucketChangeOverview.added.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="primary">
            Added Tickers:
          </Typography>
          <MergeTable
            tickerDiffs={bucketChangeOverview.added}
            actionType="added"
          />
        </Box>
      )}

      {/* Updated tickers */}
      {bucketChangeOverview.updated.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="secondary">
            Updated Tickers:
          </Typography>
          <MergeTable
            tickerDiffs={bucketChangeOverview.updated}
            actionType="updated"
          />
        </Box>
      )}

      {/* Unchanged tickers */}
      {bucketChangeOverview.unchanged.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="textSecondary">
            Unchanged Tickers:
          </Typography>
          <MergeTable
            tickerDiffs={bucketChangeOverview.unchanged}
            actionType="unchanged"
          />
        </Box>
      )}

      {/* Removed tickers */}
      {bucketChangeOverview.removed.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="textSecondary">
            Removed Tickers:
          </Typography>
          <MergeTable
            tickerDiffs={bucketChangeOverview.removed}
            actionType="removed"
          />
        </Box>
      )}
    </Box>
  );
}
