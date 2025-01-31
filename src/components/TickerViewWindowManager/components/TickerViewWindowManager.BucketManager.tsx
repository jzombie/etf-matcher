import React, { useCallback, useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  Typography,
} from "@mui/material";

import type { RustServiceTickerDetail } from "@services/RustService";
import {
  multiBucketInstancesAllowed,
  tickerBucketDefaultNames,
} from "@src/store";
import type { TickerBucket } from "@src/store";
import { Link } from "react-router-dom";

import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import DialogModal from "@components/DialogModal";
import TickerBucketForm from "@components/TickerBucketManager/TickerBucketManager.BucketForm";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

export type TickerViewWindowManagerBucketManagerProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerViewWindowManagerBucketManager({
  tickerDetail,
}: TickerViewWindowManagerBucketManagerProps) {
  const { tickerBuckets } = useStoreStateReader(["tickerBuckets"]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBucketDialogOpen, setIsBucketDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<TickerBucket | null>(
    null,
  );
  const [selectedBucketType, setSelectedBucketType] = useState<
    TickerBucket["type"] | null
  >(null);
  const [isShowingBucketForm, setIsShowingBucketForm] = useState(false);

  // Prevent bucket form from re-appearing by default when re-opening modal
  useEffect(() => {
    if (!isBucketDialogOpen) {
      setIsShowingBucketForm(false);
    }
  }, [isBucketDialogOpen]);

  const handleToggleBucket = useCallback(
    (bucket: TickerBucket, isManagementPane = false) => {
      const canHaveMultipleInstances = multiBucketInstancesAllowed.includes(
        bucket.type,
      );

      if (store.bucketHasTicker(tickerDetail.ticker_symbol, bucket)) {
        if (isManagementPane || !canHaveMultipleInstances) {
          setSelectedBucket(bucket);
          setIsDeleteDialogOpen(true);
        } else {
          setSelectedBucketType(bucket.type);
          setIsBucketDialogOpen(true);
        }
      } else {
        if (isManagementPane || !canHaveMultipleInstances) {
          store.addTickerToBucket(tickerDetail.ticker_symbol, 1, bucket);
        } else {
          setSelectedBucketType(bucket.type);
          setIsBucketDialogOpen(true);
        }
      }
    },
    [tickerDetail.ticker_symbol],
  );

  const handleConfirmRemove = useCallback(() => {
    if (selectedBucket) {
      store.removeTickerFromBucket(tickerDetail.ticker_symbol, selectedBucket);
    }
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  }, [selectedBucket, tickerDetail.ticker_symbol]);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedBucket(null);
  }, []);

  const handleCloseBucketDialog = useCallback(() => {
    setIsBucketDialogOpen(false);
    setSelectedBucketType(null);
  }, []);

  // Sort bucket types to ensure consistent order
  const userConfigurableBucketTypes = useMemo(
    () =>
      [
        ...new Set(
          tickerBuckets
            .filter((bucket) => bucket.isUserConfigurable)
            .map((bucket) => bucket.type),
        ),
      ].sort((a, b) => {
        const nameA = tickerBucketDefaultNames[a].toLowerCase();
        const nameB = tickerBucketDefaultNames[b].toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [tickerBuckets],
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Grid2 container spacing={2}>
        {userConfigurableBucketTypes.map((bucketType) => {
          const bucket = tickerBuckets.find(
            (bucket) => bucket.type === bucketType && bucket.isUserConfigurable,
          );

          if (!bucket) return null;

          const isTickerInBucketType = store.bucketTypeHasTicker(
            tickerDetail.ticker_symbol,
            bucketType,
          );

          const areMultipleInstancesAllowed =
            multiBucketInstancesAllowed.includes(bucketType);

          return (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={bucketType}>
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
                size="small"
              >
                <Box component="span" sx={{ flexGrow: 1, textAlign: "center" }}>
                  {isTickerInBucketType && areMultipleInstancesAllowed
                    ? `Manage "${tickerDetail.ticker_symbol}" in ${tickerBucketDefaultNames[bucketType]}s`
                    : isTickerInBucketType
                      ? `Remove "${tickerDetail.ticker_symbol}" from ${tickerBucketDefaultNames[bucketType]}`
                      : `Add "${tickerDetail.ticker_symbol}" to ${tickerBucketDefaultNames[bucketType]}`}
                </Box>
              </Button>
            </Grid2>
          );
        })}
      </Grid2>

      <DeleteEntityDialogModal
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onCancel={handleCloseDeleteDialog}
        onDelete={handleConfirmRemove}
        title="Confirm Delete"
        content={
          <>
            Are you sure you want to remove &quot;{tickerDetail.ticker_symbol}
            &quot; from &quot;{selectedBucket?.name}&quot;? This action cannot
            be undone.
          </>
        }
      />

      <DialogModal open={isBucketDialogOpen} onClose={handleCloseBucketDialog}>
        <DialogTitle>
          <ListAltIcon sx={{ verticalAlign: "middle", marginRight: 1 }} />{" "}
          Manage &quot;{tickerDetail.ticker_symbol}&quot; in{" "}
          {selectedBucketType
            ? `${tickerBucketDefaultNames[selectedBucketType]}s`
            : "Buckets"}{" "}
        </DialogTitle>
        <DialogContent>
          {selectedBucketType === "portfolio" && (
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", opacity: 0.7 }}
              mb={1}
            >
              Please note: Ticker quantities (or, &quot;virtual shares&quot;)
              for portfolios can currently be managed only on the{" "}
              <Link to="/portfolios">Portfolios</Link> page.
            </Typography>
          )}
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
                  tickerDetail.ticker_symbol,
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
                        ? `Remove "${tickerDetail.ticker_symbol}" from "${tickerBucket.name}"`
                        : `Add "${tickerDetail.ticker_symbol}" to "${tickerBucket.name}"`}
                    </Box>
                  </Button>
                );
              })}
          </Box>

          {isShowingBucketForm && selectedBucketType && (
            <>
              <hr />
              <TickerBucketForm
                bucketType={selectedBucketType}
                onCancel={handleCloseBucketDialog}
                onClose={() => setIsShowingBucketForm(false)}
                disableTickerSelectionFields
              />
            </>
          )}
        </DialogContent>
        {!isShowingBucketForm && (
          <DialogActions>
            {selectedBucketType && (
              <Button
                onClick={() => setIsShowingBucketForm(true)}
                disabled={isShowingBucketForm}
              >
                Create new {tickerBucketDefaultNames[selectedBucketType]}
              </Button>
            )}

            <Button
              variant="contained"
              color="error"
              onClick={handleCloseBucketDialog}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </DialogModal>
    </Box>
  );
}
