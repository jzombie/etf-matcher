import React, { useCallback, useMemo } from "react";

import store from "@src/store";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import TickerBucketMergeDiff, {
  TickerBucketMergeDiffProps,
} from "./TickerBucketMergeDiff";

export type TickerBucketMergeDiffContainerProps = Omit<
  TickerBucketMergeDiffProps,
  "currentBucket"
>;

export default function TickerBucketMergeDiffContainer({
  incomingBucket,
  onMerge,
}: TickerBucketMergeDiffContainerProps) {
  const onMergeStableRef = useStableCurrentRef(onMerge);

  const currentBucket = useMemo(() => {
    if (incomingBucket) {
      return store.getTickerBucketWithUUID(incomingBucket.uuid);
    }
  }, [incomingBucket]);

  const handleMerge = useCallback(() => {
    if (currentBucket) {
      store.updateTickerBucket(currentBucket, incomingBucket);
    } else {
      store.createTickerBucket(incomingBucket);
    }

    const onMerge = onMergeStableRef.current;
    if (typeof onMerge === "function") {
      onMerge;
    }
  }, [incomingBucket, currentBucket, onMergeStableRef]);

  return (
    <TickerBucketMergeDiff
      currentBucket={currentBucket}
      incomingBucket={incomingBucket}
      onMerge={handleMerge}
    ></TickerBucketMergeDiff>
  );
}
