import React from "react";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BucketList from "@components/BucketList";
import Scrollable from "@layoutKit/Scrollable";
import Padding from "@layoutKit/Padding";
import PortfolioForm from "@components/PortfolioForm";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Portfolios() {
  usePageTitleSetter("Portfolios");

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
          Create New Portfolio
        </Button>

        <PortfolioForm />

        <BucketList symbolBucketType="portfolio" />
      </Padding>
    </Scrollable>
  );
}

// TODO: Make use of persistent session storage for portfolios, with ability to clear data
// TODO: Enable import / export of Portfolios
// TODO: Use Web Share (and Web Share Target [for PWAs]) API as potential transport agent (binary encoding / decoding w/ Base65?)
