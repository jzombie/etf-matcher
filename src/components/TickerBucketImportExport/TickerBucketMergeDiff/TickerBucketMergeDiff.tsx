import React from "react";

import { Box, Button, Typography } from "@mui/material";

import type { TickerBucket } from "@src/store";

import MergeTable from "./MergeTable";
import useBucketChangeOverview from "./useBucketChangeOverview";

export type TickerBucketMergeDiffProps = {
  currentBucket?: TickerBucket;
  incomingBucket: TickerBucket;
  onMerge?: () => void;
};

// Merge diff component to show what will be added, updated, or unchanged
export default function TickerBucketMergeDiff({
  currentBucket,
  incomingBucket,
  onMerge,
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

      {Boolean(
        bucketChangeOverview.added.length ||
          bucketChangeOverview.updated.length,
      ) && (
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" color="primary" onClick={onMerge}>
            Merge &quot;{incomingBucket.name || "Selected Set"}&quot;
          </Button>
        </Box>
      )}
    </Box>
  );
}