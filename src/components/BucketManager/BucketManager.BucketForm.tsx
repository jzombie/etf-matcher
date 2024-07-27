import React, { useCallback, useEffect, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucketProps } from "@src/store";

export type BucketFormProps = {
  bucketType: TickerBucketProps["type"];
  existingBucket?: TickerBucketProps;
  onClose: () => void;
};

export default function BucketForm({
  bucketType,
  existingBucket,
  onClose,
}: BucketFormProps) {
  const [bucketName, setBucketName] = useState<string>("");
  const [bucketDescription, setBucketDescription] = useState<string>("");

  useEffect(() => {
    if (existingBucket) {
      setBucketName(existingBucket.name);
      setBucketDescription(existingBucket.description);
    }
  }, [existingBucket]);

  const handleSaveBucket = useCallback(() => {
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

    // Reset fields and close the form
    setBucketName("");
    setBucketDescription("");
    onClose();
  }, [bucketType, bucketName, bucketDescription, existingBucket, onClose]);

  const handleCancel = useCallback(() => {
    setBucketName("");
    setBucketDescription("");
    onClose();
  }, [onClose]);

  const isFormValid = bucketName.trim() !== "";

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
            label="Bucket Name"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            label="Bucket Description"
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
