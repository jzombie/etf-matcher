import React from "react";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export type BucketManagerProps = {};

export default function BucketManager({}: BucketManagerProps) {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddCircleOutlineIcon />}
        // onClick={handleAddFields}
        disabled
      >
        Create New [Bucket of Type]
      </Button>
    </div>
  );
}
