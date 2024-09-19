import React, { useMemo } from "react";

import store from "@src/store";

import TickerBucketMergeDiff, {
  TickerBucketMergeDiffProps,
} from "./TickerBucketMergeDiff";

export type TickerBucketMergeDiffContainerProps = Omit<
  TickerBucketMergeDiffProps,
  "currentBucket"
>;

export default function TickerBucketMergeDiffContainer({
  incomingBucket,
}: TickerBucketMergeDiffContainerProps) {
  const currentBucket = useMemo(() => {
    if (incomingBucket) {
      return store.getTickerBucketWithUUID(incomingBucket.uuid);
    }
  }, [incomingBucket]);

  return (
    <TickerBucketMergeDiff
      currentBucket={currentBucket}
      incomingBucket={incomingBucket}
    ></TickerBucketMergeDiff>
  );
}
