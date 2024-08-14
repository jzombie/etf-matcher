import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

import { tickerBucketDefaultNames } from "@src/store";
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

  const handleRemoveClick = (tickerBucket: TickerBucket) => {
    setSelectedBucket(tickerBucket);
    setIsDeleteDialogOpen(true);
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

  const handleAddClick = (type: TickerBucket["type"]) => {
    setSelectedBucketType(type);
    setIsBucketDialogOpen(true);
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
          const bucketsOfType = tickerBuckets.filter(
            (bucket) => bucket.isUserConfigurable && bucket.type === type,
          );
          const isTickerInBucket = (bucket: TickerBucket) =>
            store.bucketHasTicker(tickerDetail.ticker_id, bucket);

          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              {bucketsOfType.length === 1 ? (
                <Box>
                  {isTickerInBucket(bucketsOfType[0]) ? (
                    <Button
                      onClick={() => handleRemoveClick(bucketsOfType[0])}
                      startIcon={<DeleteIcon />}
                      color="error"
                      fullWidth
                    >
                      Remove {tickerDetail.symbol} from {bucketsOfType[0].name}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        store.addTickerToBucket(
                          tickerDetail.ticker_id,
                          1,
                          bucketsOfType[0],
                        )
                      }
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Add {tickerDetail.symbol} to {bucketsOfType[0].name}
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <Button
                    onClick={() => handleAddClick(type)}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Manage {tickerDetail.symbol} in{" "}
                    {tickerBucketDefaultNames[type]}
                  </Button>
                  {bucketsOfType.filter(isTickerInBucket).map((bucket) => (
                    <Button
                      key={bucket.name}
                      onClick={() => handleRemoveClick(bucket)}
                      startIcon={<DeleteIcon />}
                      color="error"
                      sx={{ marginTop: 1 }}
                      fullWidth
                    >
                      Remove {tickerDetail.symbol} from {bucket.name}
                    </Button>
                  ))}
                </Box>
              )}
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={isBucketDialogOpen} onClose={handleCloseBucketDialog}>
        <DialogTitle>
          <ListAltIcon sx={{ verticalAlign: "middle", marginRight: 1 }} />{" "}
          {/* Icon next to the title */}
          Manage {tickerDetail.symbol} in{" "}
          {selectedBucketType && tickerBucketDefaultNames[selectedBucketType]}{" "}
          Buckets
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6">Existing Buckets</Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto", marginBottom: 2 }}>
            {tickerBuckets
              ?.filter(
                (bucket) =>
                  bucket.isUserConfigurable &&
                  bucket.type === selectedBucketType,
              )
              .map((bucket) => (
                <Button
                  key={bucket.name}
                  onClick={() =>
                    store.bucketHasTicker(tickerDetail.ticker_id, bucket)
                      ? handleRemoveClick(bucket)
                      : store.addTickerToBucket(
                          tickerDetail.ticker_id,
                          1,
                          bucket,
                        )
                  }
                  startIcon={
                    store.bucketHasTicker(tickerDetail.ticker_id, bucket) ? (
                      <DeleteIcon />
                    ) : undefined
                  }
                  variant="contained"
                  color={
                    store.bucketHasTicker(tickerDetail.ticker_id, bucket)
                      ? "error"
                      : "primary"
                  }
                  fullWidth
                  sx={{ marginBottom: 1 }}
                >
                  {store.bucketHasTicker(tickerDetail.ticker_id, bucket)
                    ? `Remove from ${bucket.name}`
                    : `Add to ${bucket.name}`}
                </Button>
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

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Remove</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {tickerDetail.symbol} from &quot;
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
    </Box>
  );
}
