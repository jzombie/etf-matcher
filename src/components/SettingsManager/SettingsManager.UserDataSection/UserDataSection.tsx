import React, { useCallback, useState } from "react";

import { Button } from "@mui/material";

import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import Section from "@components/Section";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import TickerBucketList from "./TickerBucketList";

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
        <TickerBucketList tickerBuckets={tickerBuckets} />
      </Section>

      <DeleteEntityDialogModal
        open={isDialogOpen}
        onClose={handleCloseClearDataDialog}
        onCancel={handleCloseClearDataDialog}
        onDelete={handleConfirmDataReset}
        title="Confirm Reset"
        content={
          <>
            Are you sure you want to clear all user data? This action cannot be
            undone.
          </>
        }
      />
    </>
  );
}
