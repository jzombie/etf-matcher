import React, { useCallback, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

  const handleToggleBucket = useCallback(
    (bucket: TickerBucket, isManagementPane = false) => {
      const canHaveMultipleInstances = multiBucketInstancesAllowed.includes(
        bucket.type,
      );

      if (store.bucketHasTicker(tickerDetail.ticker_id, bucket)) {
        if (isManagementPane || !canHaveMultipleInstances) {
          setSelectedBucket(bucket);
          setIsDeleteDialogOpen(true);
        } else {
          setSelectedBucketType(bucket.type);
          setIsBucketDialogOpen(true);
        }
      } else {
        if (isManagementPane || !canHaveMultipleInstances) {
          store.addTickerToBucket(tickerDetail.ticker_id, 1, bucket);
        } else {
          setSelectedBucketType(bucket.type);
          setIsBucketDialogOpen(true);
        }
      }
    },
    [tickerDetail.ticker_id],
  );

  const handleConfirmRemove = useCallback(() => {
    if (selectedBucket) {
      store.removeTickerFromBucket(tickerDetail.ticker_id, selectedBucket);
    }
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  }, [selectedBucket, tickerDetail.ticker_id]);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  }, []);

  const handleCloseBucketDialog = useCallback(() => {
    setIsBucketDialogOpen(false);
    setSelectedBucketType(null);
  }, []);

  const bucketTypes = useMemo(
    () => [
      ...new Set(
        tickerBuckets
          .filter((bucket) => bucket.isUserConfigurable)
          .map((bucket) => bucket.type),
      ),
    ],
    [tickerBuckets],
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {bucketTypes.map((bucketType) => {
          const bucket = tickerBuckets.find(
            (bucket) => bucket.type === bucketType && bucket.isUserConfigurable,
          );

          if (!bucket) return null;

          const isTickerInBucketType = store.bucketTypeHasTicker(
            tickerDetail.ticker_id,
            bucketType,
          );

          const areMultipleInstancesAllowed =
            multiBucketInstancesAllowed.includes(bucketType);

          return (
            <Grid item xs={12} sm={6} md={4} key={bucketType}>
              <Button
                onClick={() => handleToggleBucket(bucket)}
                variant="contained"
                color={
                  isTickerInBucketType && areMultipleInstancesAllowed
                    ? "secondary"
                    : isTickerInBucketType
                      ? "error"
                      : "primary"
                }
                fullWidth
                startIcon={
                  isTickerInBucketType && areMultipleInstancesAllowed ? (
                    <EditIcon />
                  ) : isTickerInBucketType ? (
                    <DeleteIcon />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  justifyContent: "flex-start", // Left justify the icon
                  textAlign: "center", // Center the text
                }}
              >
                <Box component="span" sx={{ flexGrow: 1, textAlign: "center" }}>
                  {isTickerInBucketType && areMultipleInstancesAllowed
                    ? `Manage "${tickerDetail.symbol}" in ${tickerBucketDefaultNames[bucketType]}s`
                    : isTickerInBucketType
                      ? `Remove "${tickerDetail.symbol}" from ${tickerBucketDefaultNames[bucketType]}`
                      : `Add "${tickerDetail.symbol}" to ${tickerBucketDefaultNames[bucketType]}`}
                </Box>
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
            from &quot;{selectedBucket?.name}&quot;?
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 0px 24px 24px", // Roughly match `DialogTitle` padding, so that `Close` button can run inline
          }}
        >
          <DialogTitle sx={{ padding: 0 }}>
            <ListAltIcon sx={{ verticalAlign: "middle", marginRight: 1 }} />{" "}
            Manage &quot;{tickerDetail.symbol}&quot; in{" "}
            {selectedBucketType
              ? `${tickerBucketDefaultNames[selectedBucketType]}s`
              : "Buckets"}{" "}
          </DialogTitle>
          <DialogActions>
            <Button
              startIcon={<CloseIcon />}
              onClick={handleCloseBucketDialog}
              color="primary"
              variant="contained"
              sx={{ fontSize: "0.875rem" }}
            >
              Close
            </Button>
          </DialogActions>
        </Box>
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
              .map((tickerBucket) => {
                const bucketHasTicker = store.bucketHasTicker(
                  tickerDetail.ticker_id,
                  tickerBucket,
                );

                return (
                  <Button
                    key={tickerBucket.name}
                    onClick={() => handleToggleBucket(tickerBucket, true)}
                    variant="contained"
                    color={bucketHasTicker ? "error" : "primary"}
                    fullWidth
                    startIcon={bucketHasTicker ? <DeleteIcon /> : <AddIcon />}
                    sx={{
                      justifyContent: "flex-start", // Left justify the icon
                      textAlign: "center", // Center the text
                      marginBottom: 1,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ flexGrow: 1, textAlign: "center" }}
                    >
                      {bucketHasTicker
                        ? `Remove "${tickerDetail.symbol}" from "${tickerBucket.name}"`
                        : `Add "${tickerDetail.symbol}" to "${tickerBucket.name}"`}
                    </Box>
                  </Button>
                );
              })}
          </Box>

          {selectedBucketType && (
            <BucketForm
              bucketType={selectedBucketType}
              onCancel={handleCloseBucketDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
