import React, { useCallback, useId, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

import SearchModalButton from "@components/SearchModalButton";
import Section from "@components/Section";
import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import BucketTicker from "./BucketManager.Bucket.Ticker";
import BucketForm from "./BucketManager.BucketForm";

export type TickerBucketProps = {
  tickerBucket: TickerBucket;
};

export default function TickerBucketView({ tickerBucket }: TickerBucketProps) {
  // TODO: Consider showing by default, depending on how many buckets there are
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<TickerBucket | null>(
    null,
  );

  const alertDialogTitleId = useId();
  const alertDialogDescriptionId = useId();

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleDeleteClick = useCallback((tickerBucket: TickerBucket) => {
    setSelectedBucket(tickerBucket);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedBucket) {
      store.deleteTickerBucket(selectedBucket);
      handleClose();
    }
  }, [selectedBucket]);

  const handleEditClick = useCallback((tickerBucket: TickerBucket) => {
    setSelectedBucket(tickerBucket);
    setIsEditDialogOpen(true);
  }, []);

  const handleClose = () => {
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedBucket(null);
  };

  return (
    <>
      <Padding>
        <Section>
          <h2>{tickerBucket.name}</h2>

          <div>{tickerBucket.description}</div>

          {isEditDialogOpen && selectedBucket === tickerBucket && (
            <BucketForm
              bucketType={tickerBucket.type}
              existingBucket={selectedBucket}
              onClose={handleClose}
            />
          )}

          <Button
            onClick={toggleCollapse}
            disabled={!tickerBucket.tickers.length}
            endIcon={isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          >
            {isCollapsed ? "Expand" : "Collapse"} List
          </Button>

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
            <Box>
              {!isCollapsed && (
                <UnstyledUL>
                  {tickerBucket.tickers.map((bucketTicker) => (
                    <UnstyledLI key={bucketTicker.tickerId}>
                      <BucketTicker bucketTicker={bucketTicker} />
                    </UnstyledLI>
                  ))}
                </UnstyledUL>
              )}
            </Box>
          )}
        </Section>
      </Padding>

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
