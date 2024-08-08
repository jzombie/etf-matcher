import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucketProps } from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

export type TickerDetailBucketManagerProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerDetailBucketManager({
  tickerDetail,
}: TickerDetailBucketManagerProps) {
  const { tickerBuckets } = useStoreStateReader(["tickerBuckets"]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] =
    useState<TickerBucketProps | null>(null);
  const [selectedBucketType, setSelectedBucketType] = useState<
    TickerBucketProps["type"] | null
  >(null);

  const handleRemoveClick = (tickerBucket: TickerBucketProps) => {
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

  const handleAddClick = (type: TickerBucketProps["type"]) => {
    setSelectedBucketType(type);
    setIsSelectDialogOpen(true);
  };

  const handleCloseSelectDialog = () => {
    setIsSelectDialogOpen(false);
    setSelectedBucketType(null);
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const bucket = tickerBuckets.find(
      (b: TickerBucketProps) => b.name === event.target.value,
    );
    if (bucket) {
      store.addTickerToBucket(tickerDetail.ticker_id, 1, bucket);
    }
    setIsSelectDialogOpen(false);
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
          const isTickerInBucket = (bucket: TickerBucketProps) =>
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
                    Add {tickerDetail.symbol} to{" "}
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

      <Dialog open={isSelectDialogOpen} onClose={handleCloseSelectDialog}>
        <DialogTitle>
          Select{" "}
          {selectedBucketType && tickerBucketDefaultNames[selectedBucketType]}{" "}
          Bucket
        </DialogTitle>
        <DialogContent>
          <Select value="" onChange={handleSelectChange} displayEmpty fullWidth>
            <MenuItem value="" disabled>
              Select Bucket
            </MenuItem>
            {tickerBuckets
              ?.filter(
                (bucket) =>
                  bucket.isUserConfigurable &&
                  bucket.type === selectedBucketType,
              )
              .filter(
                (bucket) =>
                  !store.bucketHasTicker(tickerDetail.ticker_id, bucket),
              )
              .map((bucket) => (
                <MenuItem key={bucket.name} value={bucket.name}>
                  {bucket.name}
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSelectDialog} color="primary">
            Cancel
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
