// src/components/BucketManager/BucketManager.tsx

import React, { useCallback, useState } from "react";
import { Button, Box } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucketProps } from "@src/store";
import BucketList from "./BucketManager.BucketList";
import BucketForm from "./BucketManager.BucketForm";

export type BucketManagerProps = {
  bucketType: TickerBucketProps["type"];
};

export default function BucketManager({ bucketType }: BucketManagerProps) {
  const [isAddingNewTickerBucket, setIsAddingNewTickerBucket] =
    useState<boolean>(false);

  const handleCancel = useCallback(() => {
    setIsAddingNewTickerBucket(false);
  }, []);

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
          <BucketForm bucketType={bucketType} onClose={handleCancel} />
        )}
      </Box>
      <BucketList bucketType={bucketType} />
    </>
  );
}
