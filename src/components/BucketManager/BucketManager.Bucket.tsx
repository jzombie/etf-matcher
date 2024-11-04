import React, { useCallback, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Padding from "@layoutKit/Padding";
import { SIMILARITY_MATCHES_NOTICE } from "@src/constants";
import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucket } from "@src/store";

import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import ScrollTo from "@components/ScrollTo";
import SearchModalButton from "@components/SearchModalButton";
import Section from "@components/Section";
import TickerVectorQueryTable from "@components/TickerVectorQueryTable";
import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import useStoreStateReader from "@hooks/useStoreStateReader";

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

  const [alignment, setAlignment] = useState<"euclidean" | "cosine">(
    "euclidean",
  );

  const handleAlignment = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      newAlignment: "euclidean" | "cosine" | null,
    ) => {
      if (newAlignment !== null) {
        setAlignment(newAlignment);
      }
    },
    [],
  );

  const { preferredTickerVectorConfigKey } = useStoreStateReader(
    "preferredTickerVectorConfigKey",
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
                <BucketForm
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
                                <UnstyledLI key={bucketTicker.tickerId}>
                                  <BucketTicker
                                    bucketTicker={bucketTicker}
                                    tickerBucket={tickerBucket}
                                  />
                                </UnstyledLI>
                              ))}
                            </UnstyledUL>

                            {
                              // TODO: I'm holding off on adding model config selectio here
                              // (including adding in PCA radial charts), and will instead be
                              // re-using the ticker detail window management for this view.
                              // Related issue: https://linear.app/zenosmosis/issue/ZEN-128/re-use-tickerdetail-layouts-for-bucket-views
                            }
                            <Box>
                              <Typography variant="h6">
                                &quot;{tickerBucket.name}&quot; Similarity
                                Matches
                              </Typography>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                fontStyle="italic"
                              >
                                {SIMILARITY_MATCHES_NOTICE}
                              </Typography>
                              <ToggleButtonGroup
                                value={alignment}
                                exclusive
                                onChange={handleAlignment}
                                aria-label="distance metric"
                                sx={{ float: "right" }}
                                size="small"
                              >
                                <ToggleButton
                                  value="euclidean"
                                  aria-label="euclidean"
                                >
                                  <StraightenIcon />
                                  Euclidean
                                </ToggleButton>
                                <ToggleButton
                                  value="cosine"
                                  aria-label="cosine"
                                >
                                  <ShowChartIcon />
                                  Cosine
                                </ToggleButton>
                              </ToggleButtonGroup>
                              <TickerVectorQueryTable
                                tickerVectorConfigKey={
                                  preferredTickerVectorConfigKey
                                }
                                queryMode="bucket"
                                query={tickerBucket}
                                // FIXME: The key is used to update the bucket as holdings are changed; This could be improved
                                key={JSON.stringify(tickerBucket)}
                                alignment={alignment}
                              />
                            </Box>
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
                      <SearchModalButton />
                    </Box>
                  )}
                </>
              )}
            </>
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
