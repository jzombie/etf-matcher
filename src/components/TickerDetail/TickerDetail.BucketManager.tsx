import React, { useMemo, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

import {
  multiBucketInstancesAllowed,
  tickerBucketDefaultNames,
} from "@src/store";
import type { TickerBucket } from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import BucketForm from "@components/BucketManager/BucketManager.BucketForm";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

export type TickerDetailBucketManagerProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerDetailBucketManager({
  tickerDetail,
}: TickerDetailBucketManagerProps) {
  const { tickerBuckets } = useStoreStateReader(["tickerBuckets"]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBucketDialogOpen, setIsBucketDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<TickerBucket | null>(
    null,
  );
  const [selectedBucketType, setSelectedBucketType] = useState<
    TickerBucket["type"] | null
  >(null);

  const handleToggleBucket = (
    bucket: TickerBucket,
    isManagementPane = false,
  ) => {
    if (store.bucketHasTicker(tickerDetail.ticker_id, bucket)) {
      if (
        isManagementPane ||
        !multiBucketInstancesAllowed.includes(bucket.type)
      ) {
        // If in management pane or only a single instance is allowed, open delete confirmation dialog
        setSelectedBucket(bucket);
        setIsDeleteDialogOpen(true);
      } else {
        // If the bucket allows multiple instances, open the management pane
        setSelectedBucketType(bucket.type);
        setIsBucketDialogOpen(true);
      }
    } else {
      store.addTickerToBucket(tickerDetail.ticker_id, 1, bucket);
    }
  };

  const handleConfirmRemove = () => {
    if (selectedBucket) {
      store.removeTickerFromBucket(tickerDetail.ticker_id, selectedBucket);
    }
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  };

  const handleCloseBucketDialog = () => {
    setIsBucketDialogOpen(false);
    setSelectedBucketType(null);
  };

  const bucketTypes = [
    ...new Set(
      tickerBuckets
        .filter((bucket) => bucket.isUserConfigurable)
        .map((bucket) => bucket.type),
    ),
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {bucketTypes.map((type) => {
          const bucket = tickerBuckets.find(
            (bucket) => bucket.type === type && bucket.isUserConfigurable,
          );

          if (!bucket) return null;

          const isTickerInBucket = store.bucketHasTicker(
            tickerDetail.ticker_id,
            bucket,
          );

          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Button
                onClick={() => handleToggleBucket(bucket)}
                startIcon={isTickerInBucket ? <DeleteIcon /> : undefined}
                variant="contained"
                color={isTickerInBucket ? "error" : "primary"}
                fullWidth
              >
                {isTickerInBucket && multiBucketInstancesAllowed.includes(type)
                  ? `Manage "${tickerDetail.symbol}" in "${bucket.name}"`
                  : isTickerInBucket
                    ? `Remove "${tickerDetail.symbol}" from "${bucket.name}"`
                    : `Add "${tickerDetail.symbol}" to "${bucket.name}"`}
              </Button>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Remove</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove &quot;{tickerDetail.symbol}&quot;
            from &quot;
            {selectedBucket?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isBucketDialogOpen} onClose={handleCloseBucketDialog}>
        <DialogTitle>
          <ListAltIcon sx={{ verticalAlign: "middle", marginRight: 1 }} />{" "}
          Manage &quot;{tickerDetail.symbol}&quot; in{" "}
          {selectedBucketType
            ? `${tickerBucketDefaultNames[selectedBucketType]}s`
            : "Buckets"}{" "}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            Existing{" "}
            {selectedBucketType
              ? `${tickerBucketDefaultNames[selectedBucketType]}s`
              : "Buckets"}
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto", marginBottom: 2 }}>
            {tickerBuckets
              ?.filter(
                (bucket) =>
                  bucket.isUserConfigurable &&
                  bucket.type === selectedBucketType,
              )
              .map((bucket) => (
                <TickerBucketMgmtButton
                  key={bucket.name}
                  tickerDetail={tickerDetail}
                  tickerBucket={bucket}
                  onToggle={() => handleToggleBucket(bucket, true)}
                />
              ))}
          </Box>

          {selectedBucketType && (
            <BucketForm
              bucketType={selectedBucketType}
              onCancel={handleCloseBucketDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBucketDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

type TickerBucketMgmtButtonProps = ButtonProps & {
  tickerDetail: RustServiceTickerDetail;
  tickerBucket: TickerBucket;
  onToggle: () => void;
};

function TickerBucketMgmtButton({
  tickerDetail,
  tickerBucket,
  onToggle,
}: TickerBucketMgmtButtonProps) {
  const bucketHasTicker = useMemo(
    () => store.bucketHasTicker(tickerDetail.ticker_id, tickerBucket),
    [tickerDetail.ticker_id, tickerBucket],
  );

  return (
    <Button
      key={tickerBucket.name}
      onClick={onToggle}
      startIcon={bucketHasTicker ? <DeleteIcon /> : undefined}
      variant="contained"
      color={bucketHasTicker ? "error" : "primary"}
      fullWidth
      sx={{ marginBottom: 1 }}
    >
      {bucketHasTicker
        ? `Remove "${tickerDetail.symbol}" from "${tickerBucket.name}"`
        : `Add "${tickerDetail.symbol}" to "${tickerBucket.name}"`}
    </Button>
  );
}
