// src/components/BucketManager/BucketManager.tsx
import React, { useCallback, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@mui/material";

import { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucketProps } from "@src/store";

import Section from "@components/Section";

import BucketForm from "./BucketManager.BucketForm";
import BucketList from "./BucketManager.BucketList";

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
      <Section>
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
      </Section>

      <BucketList bucketType={bucketType} />
    </>
  );
}
