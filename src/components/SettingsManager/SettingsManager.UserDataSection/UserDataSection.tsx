import React, { useCallback, useState } from "react";

import { Box, Button, FormControlLabel, Switch } from "@mui/material";

import DeleteEntityDialogModal from "@components/DeleteEntityDialogModal";
import Section from "@components/Section";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import TickerBucketList from "./TickerBucketList";

// TODO: Also include any other user history (i.e. recently joined rooms, etc.)
export default function UserDataSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { tickerBuckets, appThemeProps } = useStoreStateReader([
    "tickerBuckets",
    "appThemeProps",
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

        <Box my={4} sx={{ textAlign: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={appThemeProps.fontMode === "reduced"}
                onChange={(evt) =>
                  store.setState({
                    appThemeProps: {
                      ...appThemeProps,
                      fontMode: evt.target.checked ? "reduced" : "normal",
                    },
                  })
                }
                name="fontModeToggle"
                color="primary"
              />
            }
            label="Reduced Font Mode"
          />
        </Box>

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
