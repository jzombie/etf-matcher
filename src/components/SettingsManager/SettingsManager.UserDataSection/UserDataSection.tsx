import React, { useCallback, useState } from "react";

import AssessmentIcon from "@mui/icons-material/Assessment";
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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tickerBuckets?.map((tickerBucket, idx) => (
            <li key={idx}>
              <Section>
                <AssessmentIcon
                  sx={{
                    fontSize: 24,
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: 1,
                  }}
                />
                <Typography variant="body1" sx={{ display: "inline-block" }}>
                  <span style={{ fontWeight: "bold" }}>
                    {tickerBucket.name}
                  </span>
                  :{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: ".8rem",
                    }}
                  >
                    ({tickerBucket.tickers.length} item
                    {tickerBucket.tickers.length !== 1 ? "s" : ""})
                  </span>
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {tickerBucket.tickers.map((ticker) => (
                    <TickerBucketItem
                      key={ticker.tickerId}
                      tickerBucketTicker={ticker}
                    />
                  ))}
                </div>
              </Section>
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
