import React, { useCallback, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

import Section from "@components/Section";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import TickerBucketItem from "./TickerBucketItem";

// TODO: Also include any other user history (i.e. recently joined rooms, etc.)
export default function UserDataSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { tickerBuckets } = useStoreStateReader([
    "isHTMLJSVersionSynced",
    "isAppUnlocked",
    "isIndexedDBReady",
    "isProductionBuild",
    "isRustInit",
    "dataBuildTime",
    "isDirtyState",
    "visibleTickerIds",
    "isOnline",
    "isProfilingCacheOverlayOpen",
    "isGAPageTrackingEnabled",
    "tickerBuckets",
    "cacheDetails",
    "cacheSize",
    "rustServiceXHRRequestErrors",
    "subscribedMQTTRoomNames",
  ]);

  const handleOpenClearDataDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseClearDataDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleConfirmDataReset = useCallback(() => {
    store.reset();
    setIsDialogOpen(false);
  }, []);

  return (
    <>
      <Section>
        <h2>User Data</h2>
        <Button
          variant="contained"
          color="error"
          onClick={handleOpenClearDataDialog}
        >
          Clear User Data
        </Button>
        <h3>Buckets</h3>
        {
          // TODO: For each bucket, show the contents, using logos
        }
        <ul>
          {tickerBuckets?.map((tickerBucket, idx) => (
            <li key={idx} style={{ padding: 9 }}>
              <Typography variant="body1">
                <span style={{ fontWeight: "bold" }}>{tickerBucket.name}</span>:{" "}
                <span style={{ fontStyle: "italic", fontSize: ".8rem" }}>
                  ({tickerBucket.tickers.length} item
                  {tickerBucket.tickers.length !== 1 ? "s" : ""})
                </span>
              </Typography>
              <div>
                {tickerBucket.tickers.map((ticker) => (
                  <TickerBucketItem
                    key={ticker.tickerId}
                    tickerBucketTicker={ticker}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseClearDataDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Reset</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to clear all user data? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearDataDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDataReset} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
