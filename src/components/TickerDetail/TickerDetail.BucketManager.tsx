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
    const isUserConfigurable = tickerBuckets.some(
      (bucket) => bucket.type === type && bucket.isUserConfigurable,
    );

    if (isUserConfigurable && multiBucketInstancesAllowed.includes(type)) {
      setSelectedBucketType(type);
      setIsBucketDialogOpen(true);
    } else {
      const bucket = tickerBuckets.find(
        (bucket) => bucket.type === type && bucket.isUserConfigurable,
      );
      if (bucket) {
        store.addTickerToBucket(tickerDetail.ticker_id, 1, bucket);
      }
    }
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
          const isTickerInBucket = bucket
            ? store.bucketHasTicker(tickerDetail.ticker_id, bucket)
            : false;

          const buttonText =
            isTickerInBucket && multiBucketInstancesAllowed.includes(type)
              ? `Manage "${tickerDetail.symbol}" in ${tickerBucketDefaultNames[type]}`
              : `Add "${tickerDetail.symbol}" to ${tickerBucketDefaultNames[type]}`;

          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {!isTickerInBucket ||
                multiBucketInstancesAllowed.includes(type) ? (
                  <Button
                    onClick={() => handleAddClick(type)}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {buttonText}
                  </Button>
                ) : null}
                {isTickerInBucket && (
                  <Button
                    onClick={() => handleRemoveClick(bucket!)}
                    startIcon={<DeleteIcon />}
                    color="error"
                    fullWidth
                  >
                    Remove {tickerDetail.symbol} from {bucket!.name}
                  </Button>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

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
                  onRemove={(bucket) => handleRemoveClick(bucket)}
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

type TickerBucketMgmtButtonProps = ButtonProps & {
  tickerDetail: RustServiceTickerDetail;
  tickerBucket: TickerBucket;
  onRemove: (tickerBucket: TickerBucket) => void;
};

function TickerBucketMgmtButton({
  tickerDetail,
  tickerBucket,
  onRemove,
}: TickerBucketMgmtButtonProps) {
  const bucketHasTicker = useMemo(
    () => store.bucketHasTicker(tickerDetail.ticker_id, tickerBucket),
    [tickerDetail.ticker_id, tickerBucket],
  );

  return (
    <Button
      key={tickerBucket.name}
      onClick={() =>
        bucketHasTicker
          ? onRemove(tickerBucket)
          : store.addTickerToBucket(tickerDetail.ticker_id, 1, tickerBucket)
      }
      startIcon={bucketHasTicker ? <DeleteIcon /> : undefined}
      variant="contained"
      color={bucketHasTicker ? "error" : "primary"}
      fullWidth
      sx={{ marginBottom: 1 }}
    >
      {bucketHasTicker
        ? `Remove from ${tickerBucket.name}`
        : `Add to ${tickerBucket.name}`}
    </Button>
  );
}
