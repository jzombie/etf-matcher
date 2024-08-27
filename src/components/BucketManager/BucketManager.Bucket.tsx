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
import store, { tickerBucketDefaultNames } from "@src/store";
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

  const alertDialogTitleId = useId();
  const alertDialogDescriptionId = useId();

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    // Prevent delete dialog from staying open after delete; I think this could be a
    // bug with MUI because the dialog *should* close when this component unmounts.
    setIsDeleteDialogOpen(false);

    store.deleteTickerBucket(tickerBucket);
  }, [tickerBucket]);

  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
  }, []);

  return (
    <>
      <Padding>
        <Section>
          <h2>{tickerBucket.name}</h2>

          <div>{tickerBucket.description}</div>

          {isEditDialogOpen && (
            <BucketForm
              bucketType={tickerBucket.type}
              existingBucket={tickerBucket}
              onClose={handleClose}
            />
          )}

          <Box>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
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
          </Box>

          {tickerBucket.tickers.length > 0 ? (
            <>
              <Box sx={{ textAlign: "center" }}>
                <Button
                  onClick={toggleCollapse}
                  disabled={!tickerBucket.tickers.length}
                  endIcon={
                    isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />
                  }
                >
                  {isCollapsed ? "Expand" : "Collapse"} List
                </Button>
              </Box>

              <Box>
                {!isCollapsed && (
                  <UnstyledUL>
                    {tickerBucket.tickers.map((bucketTicker) => (
                      <UnstyledLI key={bucketTicker.tickerId}>
                        <BucketTicker
                          bucketTicker={bucketTicker}
                          tickerBucket={tickerBucket}
                        />
                      </UnstyledLI>
                    ))}
                  </UnstyledUL>
                )}

                {
                  // TODO: Remove; Just for debugging

                  import.meta.env.DEV && (
                    <Button
                      onClick={() =>
                        store.fetchClosestTickersByQuantity(tickerBucket)
                      }
                    >
                      PROTO::createCustomVector()
                    </Button>
                  )
                }
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
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
            Are you sure you want to delete the{" "}
            {tickerBucketDefaultNames[tickerBucket.type].toLowerCase()} &quot;
            {tickerBucket?.name}&quot;? This action cannot be undone.
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
