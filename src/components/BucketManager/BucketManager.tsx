import React from "react";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import type { SymbolBucketProps } from "@src/store";

export type BucketManagerProps = {
  bucketType: SymbolBucketProps["type"];
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
        Create New {bucketType}
      </Button>
    </div>
  );
}
