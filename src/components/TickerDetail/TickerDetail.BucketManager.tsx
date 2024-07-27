import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

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
  const [selectedBucket, setSelectedBucket] =
    useState<TickerBucketProps | null>(null);

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

  const handleClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  };

  return (
    <>
      {tickerBuckets
        ?.filter(
          (tickerBucket: TickerBucketProps) => tickerBucket.isUserConfigurable,
        )
        .map((tickerBucket: TickerBucketProps, idx: number) => {
          if (!store.bucketHasTicker(tickerDetail.ticker_id, tickerBucket)) {
            return (
              <Button
                key={idx}
                onClick={() =>
                  store.addTickerToBucket(
                    tickerDetail.ticker_id,
                    1,
                    tickerBucket,
                  )
                }
              >
                Add {tickerDetail.symbol} to {tickerBucket.name}
              </Button>
            );
          } else {
            return (
              <Button
                key={idx}
                onClick={() => handleRemoveClick(tickerBucket)}
                startIcon={<DeleteIcon />}
                color="error"
              >
                Remove {tickerDetail.symbol} from {tickerBucket.name}
              </Button>
            );
          }
        })}

      <Dialog open={isDeleteDialogOpen} onClose={handleClose}>
        <DialogTitle>Confirm Remove</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {tickerDetail.symbol} from &quot;
            {selectedBucket?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
