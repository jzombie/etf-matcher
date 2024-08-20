import React, { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, TextField, Typography } from "@mui/material";

import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucket } from "@src/store";

import { useNotification } from "@hooks/useNotification";

const MIN_BUCKET_NAME_LENGTH: number = 3;

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
    if (existingBucket) {
      setBucketName(existingBucket.name);
      setBucketDescription(existingBucket.description);
    }
  }, [existingBucket]);

  const handleSaveBucket = useCallback(() => {
    let hasError = false;

    // Reset errors
    setNameError(null);

    // Validate the form fields
    if (bucketName.trim() === "") {
      setNameError("Name is required.");
      hasError = true;
    } else if (bucketName.trim().length < MIN_BUCKET_NAME_LENGTH) {
      setNameError(
        `Name must be at least ${MIN_BUCKET_NAME_LENGTH} character${MIN_BUCKET_NAME_LENGTH !== 1 ? "s" : ""} long.`,
      );
      hasError = true;
    }

    if (!hasError) {
      if (existingBucket) {
        store.updateTickerBucket(existingBucket, {
          ...existingBucket,
          name: bucketName,
          description: bucketDescription,
        });
      } else {
        try {
          store.createTickerBucket({
            name: bucketName,
            type: bucketType,
            description: bucketDescription,
            isUserConfigurable: true,
          });
        } catch (err) {
          showNotification(
            `Could not create new bucket. Ensure the name is unique.`,
            "error",
          );

          hasError = true;
        }
      }
    }

    if (!hasError) {
      // Reset fields and close the form
      setBucketName("");
      setBucketDescription("");

      if (typeof onClose === "function") {
        onClose();
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

  const isFormValid =
    bucketName.trim() !== "" &&
    bucketName.trim().length >= MIN_BUCKET_NAME_LENGTH;

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
            onChange={(e) => setBucketName(e.target.value)}
            variant="outlined"
            fullWidth
            required
          />
          {bucketName.trim() !== "" && (
            <Alert
              severity={
                bucketName.trim().length >= MIN_BUCKET_NAME_LENGTH && !nameError
                  ? "success"
                  : "error"
              }
              sx={{ mt: 2 }}
            >
              {bucketName.trim().length >= MIN_BUCKET_NAME_LENGTH && !nameError
                ? "Name is valid."
                : nameError ||
                  `Name must be at least ${MIN_BUCKET_NAME_LENGTH} character${MIN_BUCKET_NAME_LENGTH !== 1 ? "s" : ""} long.`}
            </Alert>
          )}
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
