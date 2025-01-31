import React, { useCallback, useMemo, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, Typography } from "@mui/material";

import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucket } from "@src/store";
import { Link } from "react-router-dom";

import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import Padding from "@components/Padding";
import ScrollTo from "@components/ScrollTo";
import Section from "@components/Section";
import TickerSearchModalButton from "@components/TickerSearchModalButton";
import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import {
  formatTickerBucketPageTitle,
  getTickerBucketLink,
} from "@utils/tickerBucketLinkUtils";

import TickerBucketTicker from "./TickerBucketManager.Bucket.Ticker";
import TickerBucketForm from "./TickerBucketManager.BucketForm";

export type TickerBucketProps = {
  tickerBucket: TickerBucket;
};

export default function TickerBucketView({ tickerBucket }: TickerBucketProps) {
  // TODO: Consider showing by default, depending on how many buckets there are
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleFormClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setIsEditing(false);

    setIsCollapsed(false);
  }, []);

  const tickerBucketLink = useMemo(
    () => getTickerBucketLink(tickerBucket),
    [tickerBucket],
  );

  const formattedTickerBucketPageTitle = useMemo(
    () => formatTickerBucketPageTitle(tickerBucket),
    [tickerBucket],
  );

  return (
    <>
      <ScrollTo disabled={isCollapsed}>
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
                  sx={{ marginRight: 2 }}
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
                <TickerBucketForm
                  bucketType={tickerBucket.type}
                  existingBucket={tickerBucket}
                  onClose={handleFormClose}
                />
              </ScrollTo>
            )}
            <>
              {!isEditing && (
                <>
                  {tickerBucket.tickers.length > 0 ? (
                    <>
                      <Box sx={{ textAlign: "center" }} mt={1}>
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
                      </Box>

                      <Box>
                        {!isCollapsed && (
                          <>
                            <UnstyledUL>
                              {tickerBucket.tickers.map((bucketTicker) => (
                                <UnstyledLI key={bucketTicker.symbol}>
                                  <TickerBucketTicker
                                    bucketTicker={bucketTicker}
                                    tickerBucket={tickerBucket}
                                  />
                                </UnstyledLI>
                              ))}
                            </UnstyledUL>
                          </>
                        )}
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
                      <TickerSearchModalButton />
                    </Box>
                  )}
                </>
              )}
            </>
            {tickerBucket.tickers.length > 0 && (
              <Link to={tickerBucketLink}>
                Go to &quot;{formattedTickerBucketPageTitle}&quot; page
              </Link>
            )}
          </Section>
        </Padding>
      </ScrollTo>

      <DeleteEntityDialogModal
        open={isDeleteDialogOpen}
        title="Confirm Delete"
        content={
          <>
            Are you sure you want to delete the{" "}
            {tickerBucketDefaultNames[tickerBucket.type].toLowerCase()} &quot;
            {tickerBucket?.name}&quot;? This action cannot be undone.
          </>
        }
        onClose={handleFormClose}
        onCancel={handleFormClose}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
