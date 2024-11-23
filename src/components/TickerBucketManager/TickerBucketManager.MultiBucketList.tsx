import React, { useMemo } from "react";

import type { TickerBucket } from "@src/store";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import useStoreStateReader from "@hooks/useStoreStateReader";

import TickerBucketView from "./TickerBucketManager.Bucket";

export type MultiBucketListProps = {
  bucketType: TickerBucket["type"];
};

export default function MultiBucketList({ bucketType }: MultiBucketListProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const tickerBucketsOfType = useMemo(
    () =>
      tickerBuckets?.filter((tickerBucket) => tickerBucket.type === bucketType),
    [tickerBuckets, bucketType],
  );

  return (
    <>
      <UnstyledUL>
        {tickerBucketsOfType?.map((tickerBucket, idx) => (
          <UnstyledLI key={idx}>
            <TickerBucketView tickerBucket={tickerBucket} />
          </UnstyledLI>
        ))}
      </UnstyledUL>
    </>
  );
}
