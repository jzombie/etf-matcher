import React from "react";

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
  return (
    <TickerBucketMergeDiff
      // TODO: Route `currentBucket`
      incomingBucket={incomingBucket}
    ></TickerBucketMergeDiff>
  );
}
