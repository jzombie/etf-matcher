import React, { useCallback, useState } from "react";
import { Button, TextField, Box, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import store, { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucketProps } from "@src/store";
import BucketList from "./BucketManager.BucketList";

export type BucketManagerProps = {
  bucketType: TickerBucketProps["type"];
};

export default function BucketManager({ bucketType }: BucketManagerProps) {
  const [isAddingNewTickerBucket, setIsAddingNewTickerBucket] =
    useState<boolean>(false);
  const [bucketName, setBucketName] = useState<string>("");
  const [bucketDescription, setBucketDescription] = useState<string>("");

  const handleSaveBucket = useCallback(() => {
    store.createTickerBucket({
      name: bucketName,
      type: bucketType,
      description: bucketDescription,
      isUserConfigurable: true,
    });

    // Reset fields
    setIsAddingNewTickerBucket(false);
    setBucketName("");
    setBucketDescription("");
  }, [bucketType, bucketName, bucketDescription]);

  const handleCancel = useCallback(() => {
    setIsAddingNewTickerBucket(false);
    setBucketName("");
    setBucketDescription("");
  }, []);

  const isFormValid = bucketName.trim() !== "";

  return (
    <>
      <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "8px" }}>
        <Button
          variant={!isAddingNewTickerBucket ? "contained" : "text"}
          color={!isAddingNewTickerBucket ? "primary" : "error"}
          startIcon={
            !isAddingNewTickerBucket ? <AddCircleOutlineIcon /> : <CancelIcon />
          }
          onClick={() => setIsAddingNewTickerBucket((prev) => !prev)}
        >
          {!isAddingNewTickerBucket ? "Create" : "Cancel"} New{" "}
          {tickerBucketDefaultNames[bucketType]}
        </Button>

        {isAddingNewTickerBucket && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">
              Add New {tickerBucketDefaultNames[bucketType]}
            </Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBucket();
              }}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
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
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    disabled={!isFormValid}
                  >
                    Save New {tickerBucketDefaultNames[bucketType]}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        )}
      </Box>
      <BucketList bucketType={bucketType} />
    </>
  );
}
