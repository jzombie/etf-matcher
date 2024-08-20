import React, { useCallback, useEffect, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucket } from "@src/store";

import { useNotification } from "@hooks/useNotification";

export type BucketFormProps = {
  bucketType: TickerBucket["type"];
  existingBucket?: TickerBucket;
  onClose?: () => void;
  onCancel?: () => void;
};

export default function BucketForm({
  bucketType,
  existingBucket,
  onClose,
  onCancel,
}: BucketFormProps) {
  const [bucketName, setBucketName] = useState<string>("");
  const [bucketDescription, setBucketDescription] = useState<string>("");

  const [nameError, setNameError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    let errMsg = "";

    try {
      store.validateTickerBucketName(bucketName, bucketType);
    } catch (err) {
      errMsg = err?.toString() || "";
    } finally {
      setNameError(errMsg);
    }
  }, [bucketName, bucketType]);

  useEffect(() => {
    if (existingBucket) {
      setBucketName(existingBucket.name);
      setBucketDescription(existingBucket.description);
    }
  }, [existingBucket]);

  const handleSaveBucket = useCallback(() => {
    try {
      if (existingBucket) {
        store.updateTickerBucket(existingBucket, {
          ...existingBucket,
          name: bucketName,
          description: bucketDescription,
        });
      } else {
        store.createTickerBucket({
          name: bucketName,
          type: bucketType,
          description: bucketDescription,
          isUserConfigurable: true,
        });
      }

      // Reset fields and close the form if successful
      setBucketName("");
      setBucketDescription("");

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        setNameError(err.message);
        showNotification(err.message, "error");
      }
    }
  }, [
    bucketType,
    bucketName,
    bucketDescription,
    existingBucket,
    onClose,
    showNotification,
  ]);

  const handleCancel = useCallback(() => {
    setBucketName("");
    setBucketDescription("");

    if (typeof onClose === "function") {
      onClose();
    }

    if (typeof onCancel === "function") {
      onCancel();
    }
  }, [onClose, onCancel]);

  const isFormValid = !nameError && bucketName.trim() !== "";

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">
        {existingBucket ? "Edit" : "Add New"}{" "}
        {tickerBucketDefaultNames[bucketType]}
      </Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveBucket();
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={`${tickerBucketDefaultNames[bucketType]} Name`}
            value={bucketName}
            onChange={(e) => {
              setBucketName(e.target.value);
            }}
            variant="outlined"
            fullWidth
            required
            error={!!nameError}
            helperText={nameError}
          />
          <TextField
            label={`${tickerBucketDefaultNames[bucketType]} Description`}
            value={bucketDescription}
            onChange={(e) => setBucketDescription(e.target.value)}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={!isFormValid}
            >
              Save {tickerBucketDefaultNames[bucketType]}
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
