// src/components/BucketManager/BucketManager.tsx
import React, { useCallback, useState } from "react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@mui/material";

import { tickerBucketDefaultNames } from "@src/store";
import type { TickerBucket } from "@src/store";

import Padding from "@components/Padding";
import Section from "@components/Section";

import TickerBucketForm from "./TickerBucketManager.BucketForm";
import TickerMultiBucketList from "./TickerBucketManager.MultiBucketList";

export type TickerBucketManagerProps = {
  bucketType: TickerBucket["type"];
};

export default function TickerBucketManager({
  bucketType,
}: TickerBucketManagerProps) {
  const [isAddingNewTickerBucket, setIsAddingNewTickerBucket] =
    useState<boolean>(false);

  const handleCancel = useCallback(() => {
    setIsAddingNewTickerBucket(false);
  }, []);

  return (
    <>
      <Padding>
        <Section>
          <Button
            variant={!isAddingNewTickerBucket ? "contained" : "text"}
            color={!isAddingNewTickerBucket ? "primary" : "error"}
            startIcon={
              !isAddingNewTickerBucket ? (
                <AddCircleOutlineIcon />
              ) : (
                <CancelIcon />
              )
            }
            onClick={() => setIsAddingNewTickerBucket((prev) => !prev)}
          >
            {!isAddingNewTickerBucket ? "Create" : "Cancel"} New{" "}
            {tickerBucketDefaultNames[bucketType]}
          </Button>

          {isAddingNewTickerBucket && (
            <TickerBucketForm bucketType={bucketType} onClose={handleCancel} />
          )}
        </Section>
      </Padding>

      <TickerMultiBucketList bucketType={bucketType} />
    </>
  );
}
