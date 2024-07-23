import React from "react";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BucketList from "@components/BucketList";
import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";
import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Watchlists() {
  usePageTitleSetter("Watchlists");

  return (
    <Scrollable>
      <Padding>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          // onClick={handleAddFields}
          disabled
        >
          Create New Watchlist
        </Button>
        <BucketList symbolBucketType="watchlist" />
      </Padding>
    </Scrollable>
  );
}
