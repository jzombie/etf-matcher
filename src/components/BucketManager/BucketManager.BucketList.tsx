import React, { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TickerDetailList from "@components/TickerDetailList";
import Section from "@components/Section";
import SearchModalButton from "@components/SearchModalButton";
import useStoreStateReader from "@hooks/useStoreStateReader";
import store from "@src/store";
import type { TickerBucketProps } from "@src/store";
import BucketForm from "./BucketManager.BucketForm";

export type BucketListProps = {
  bucketType: TickerBucketProps["type"];
};

export default function BucketList({ bucketType }: BucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const localTickerBucket = useMemo(
    () =>
      tickerBuckets?.filter((tickerBucket) => tickerBucket.type === bucketType),
    [tickerBuckets, bucketType]
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] =
    useState<TickerBucketProps | null>(null);

  const handleDeleteClick = (bucket: TickerBucketProps) => {
    setSelectedBucket(bucket);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (bucket: TickerBucketProps) => {
    setSelectedBucket(bucket);
    setIsEditDialogOpen(true);
  };

  const handleClose = () => {
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedBucket(null);
  };

  const handleConfirmDelete = () => {
    if (selectedBucket) {
      store.deleteTickerBucket(selectedBucket);
      handleClose();
    }
  };

  return (
    <>
      {localTickerBucket?.map((tickerBucket, idx) => (
        <React.Fragment key={idx}>
          <Section>
            <h2>{tickerBucket.name}</h2>

            <div>{tickerBucket.description}</div>

            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(tickerBucket)}
            >
              Delete
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleEditClick(tickerBucket)}
            >
              Edit
            </Button>

            {isEditDialogOpen && selectedBucket === tickerBucket && (
              <BucketForm
                bucketType={bucketType}
                existingBucket={selectedBucket}
                onClose={handleClose}
              />
            )}

            {!tickerBucket.tickers.length && (
              <>
                <Typography variant="body2" color="textSecondary">
                  No items in &quot;{tickerBucket.name}&quot;.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "inline-block", marginRight: 1 }}
                >
                  Perhaps you might wish to perform a{" "}
                  {/* [`Search` button follows] */}
                </Typography>
                <SearchModalButton />
              </>
            )}
          </Section>

          <TickerDetailList
            tickerIds={tickerBucket.tickers.map(({ tickerId }) => tickerId)}
          />
        </React.Fragment>
      ))}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the bucket &quot;
            {selectedBucket?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
