import React, { useId, useMemo, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

import Padding from "@layoutKit/Padding";
import store from "@src/store";
import type { TickerBucket } from "@src/store";

import LazyRender from "@components/LazyRender";
import SearchModalButton from "@components/SearchModalButton";
import Section from "@components/Section";

import useStoreStateReader from "@hooks/useStoreStateReader";

import BucketTicker from "./BucketManager.Bucket.Ticker";
import BucketForm from "./BucketManager.BucketForm";

export type BucketListProps = {
  bucketType: TickerBucket["type"];
};

{
  // TODO: Finish wiring up `Delete` button and update the text accordingly
  // TODO: Add button to navigate to the full symbol
}

export default function BucketList({ bucketType }: BucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const localTickerBucket = useMemo(
    () =>
      tickerBuckets?.filter((tickerBucket) => tickerBucket.type === bucketType),
    [tickerBuckets, bucketType],
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<TickerBucket | null>(
    null,
  );

  const handleDeleteClick = (bucket: TickerBucket) => {
    setSelectedBucket(bucket);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (bucket: TickerBucket) => {
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

  const alertDialogTitleId = useId();
  const alertDialogDescriptionId = useId();

  return (
    <>
      {localTickerBucket?.map((tickerBucket, idx) => (
        <React.Fragment key={idx}>
          <Padding>
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

              <Typography
                style={{
                  display: "inline-block",
                  marginLeft: 8,
                  fontStyle: "italic",
                }}
                variant="body2"
              >
                {`${tickerBucket.tickers.length} item${tickerBucket.tickers.length !== 1 ? "s" : ""}`}
              </Typography>

              {isEditDialogOpen && selectedBucket === tickerBucket && (
                <BucketForm
                  bucketType={bucketType}
                  existingBucket={selectedBucket}
                  onClose={handleClose}
                />
              )}

              {!tickerBucket.tickers.length ? (
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
              ) : (
                <LazyRender>
                  <Box sx={{ marginTop: 1 }}>
                    {tickerBucket.tickers.map((bucketTicker) => (
                      <BucketTicker
                        key={bucketTicker.tickerId}
                        bucketTicker={bucketTicker}
                      />
                    ))}
                  </Box>
                </LazyRender>
              )}
            </Section>
          </Padding>
        </React.Fragment>
      ))}

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleClose}
        aria-labelledby={alertDialogTitleId}
        aria-describedby={alertDialogDescriptionId}
      >
        <DialogTitle id={alertDialogTitleId}>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id={alertDialogDescriptionId}>
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
