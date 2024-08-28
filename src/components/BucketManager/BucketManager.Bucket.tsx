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

import ScrollTo from "@components/ScrollTo";
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
  const [isEditing, setIsEditing] = useState(false);

  const alertDialogTitleId = useId();
  const alertDialogDescriptionId = useId();

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    store.deleteTickerBucket(tickerBucket);
  }, [tickerBucket]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setIsEditing(false);

    setIsCollapsed(false);
  }, []);

  return (
    <>
      <Padding>
        <Section>
          <Box
            sx={{
              display: "flex",
              justifyContent: !isEditing ? "space-between" : "right",
              alignItems: "center",
            }}
          >
            {!isEditing && (
              <Typography variant="h5">{tickerBucket.name}</Typography>
            )}

            <Box>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
              <Button
                color="primary"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{ marginRight: 1 }}
                disabled={isEditing}
              >
                Edit
              </Button>
            </Box>
          </Box>
          {!isEditing && (
            <Typography
              style={{
                fontStyle: "italic",
              }}
              variant="body2"
            >
              {`${tickerBucket.tickers.length} item${tickerBucket.tickers.length !== 1 ? "s" : ""}`}
            </Typography>
          )}

          {tickerBucket.description && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              {tickerBucket.description}
            </Typography>
          )}

          {isEditing && (
            <ScrollTo>
              <BucketForm
                bucketType={tickerBucket.type}
                existingBucket={tickerBucket}
                onClose={handleClose}
              />
            </ScrollTo>
          )}

          <>
            {!isEditing && (
              <>
                {tickerBucket.tickers.length > 0 ? (
                  <>
                    <Box sx={{ textAlign: "center" }} mt={1}>
                      <ScrollTo disabled={isCollapsed}>
                        <Button
                          onClick={toggleCollapse}
                          disabled={!tickerBucket.tickers.length}
                          endIcon={
                            isCollapsed ? (
                              <ExpandMoreIcon />
                            ) : (
                              <ExpandLessIcon />
                            )
                          }
                        >
                          {isCollapsed ? "Expand" : "Collapse"} List
                        </Button>
                      </ScrollTo>
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
              </>
            )}
          </>
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
