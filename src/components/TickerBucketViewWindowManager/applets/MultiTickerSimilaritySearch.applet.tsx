import React, { useEffect } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import useTickerVectorQuery from "@hooks/useTickerVectorQuery";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSimilaritySearchAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerSimilaritySearchApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerSimilaritySearchAppletProps) {
  const { adjustedTickerBucket } = useTickerSelectionManagerContext();

  const { fetchEuclidean, resultsEuclidean } = useTickerVectorQuery({
    tickerVectorConfigKey: "default", // TODO: Don't hardocde
    queryMode: "bucket",
    query: adjustedTickerBucket,
  });

  useEffect(() => {
    if (adjustedTickerBucket) {
      fetchEuclidean();
    }
  }, [adjustedTickerBucket, fetchEuclidean]);

  // TODO: Handle
  // useEffect(() => {
  //   console.log({ resultsEuclidean });
  // }, [resultsEuclidean]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      [TODO: Build out]
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
