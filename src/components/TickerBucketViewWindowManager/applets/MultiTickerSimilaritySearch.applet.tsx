import React from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";

// import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSimilaritySearchAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerSimilaritySearchApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerSimilaritySearchAppletProps) {
  // TODO: Factor in weightings
  // const { selectedTickerIds } = useTickerSelectionManagerContext();

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      [TODO: Build out]
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
