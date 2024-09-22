import React, { useMemo } from "react";

import useTickerBucketImportExportContext from "@hooks/useTickerBucketImportExportContext";

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
  const { getSameLocalBucket } = useTickerBucketImportExportContext();

  const currentBucket = useMemo(() => {
    if (incomingBucket) {
      return getSameLocalBucket(incomingBucket.type, incomingBucket.name);
    }
  }, [getSameLocalBucket, incomingBucket]);

  return (
    <TickerBucketMergeDiff
      currentBucket={currentBucket}
      incomingBucket={incomingBucket}
    ></TickerBucketMergeDiff>
  );
}
