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

import TickerBucketList from "./TickerBucketList";

// TODO: Also include any other user history (i.e. recently joined rooms, etc.)
export default function UserDataSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [
    includeNonUserConfigurableBuckets,
    setIncludeNonUserConfigurableBuckets,
  ] = useState<boolean>(false);

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
        <TickerBucketList
          tickerBuckets={tickerBuckets}
          includeNonUserConfigurable={includeNonUserConfigurableBuckets}
        />

        <Button
          onClick={() => setIncludeNonUserConfigurableBuckets((prev) => !prev)}
        >
          {includeNonUserConfigurableBuckets
            ? "Hide System Buckets"
            : "Show System Buckets"}
        </Button>
        <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.5 }}>
          &quot;System Buckets&quot; are non-user-configurable and are
          auto-populated by the app during the course of interaction. These are
          private to the session (unless &quot;Session Sharing&quot; is enabled)
          and are used to help the app make recommendations.
        </Typography>
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
