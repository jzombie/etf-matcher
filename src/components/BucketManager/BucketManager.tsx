import React from "react";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { tickerBucketDefaultNames } from "@src/store";
import type { SymbolBucketProps } from "@src/store";

export type BucketManagerProps = {
  bucketType: SymbolBucketProps["bucketType"];
};

export default function BucketManager({ bucketType }: BucketManagerProps) {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddCircleOutlineIcon />}
        // onClick={handleAddFields}
        disabled
      >
        {
          // TODO: Format this better
        }
        Create New {tickerBucketDefaultNames[bucketType]}
      </Button>
    </div>
  );
}
