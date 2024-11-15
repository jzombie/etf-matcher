import React, { useEffect } from "react";

import { fetchEuclideanByTickerBucket } from "@services/RustService";
import { RustServiceTickerDistance } from "@services/RustService";
import { TickerBucket } from "@src/store";

import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
// import useObjectHash from "@hooks/useObjectHash";
import usePromise from "@hooks/usePromise";
import useStoreStateReader from "@hooks/useStoreStateReader";

import customLogger from "@utils/customLogger";

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
  const { triggerUIError } = useAppErrorBoundary();

  const { adjustedTickerBucket } = useTickerSelectionManagerContext();

  const { preferredTickerVectorConfigKey } = useStoreStateReader(
    "preferredTickerVectorConfigKey",
  );

  const { data: tickerDistances, execute: fetchTickerDistances } = usePromise<
    RustServiceTickerDistance[],
    [tickerVectorConfigKey: string, adjustedTickerBucket: TickerBucket]
  >({
    fn: (tickerVectorConfigKey, adjustedTickerBucket) =>
      fetchEuclideanByTickerBucket(tickerVectorConfigKey, adjustedTickerBucket),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not fetch PCA similarity results"));
    },
    autoExecute: false,
  });

  // const hashedTickerDistances = useObjectHash(tickerDistances);

  useEffect(() => {
    if (preferredTickerVectorConfigKey && adjustedTickerBucket) {
      fetchTickerDistances(
        preferredTickerVectorConfigKey,
        adjustedTickerBucket,
      );
    }
  }, [
    preferredTickerVectorConfigKey,
    adjustedTickerBucket,
    fetchTickerDistances,
  ]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      {
        // TODO: Finish adding other similarity search components
      }
      <TickerPCAScatterPlot tickerDistances={tickerDistances} />
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
