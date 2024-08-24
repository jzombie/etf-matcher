import React from "react";

import type { TickerBucket } from "@src/store";

import { UnstyledLI, UnstyledUL } from "@components/Unstyled";

import BucketTicker from "./BucketManager.Bucket.Ticker";

export type TickerBucketProps = {
  tickerBucket: TickerBucket;
};

export default function TickerBucketView({ tickerBucket }: TickerBucketProps) {
  return (
    // TODO: Add option to collapse or expand list
    <UnstyledUL>
      {tickerBucket.tickers.map((bucketTicker) => (
        <UnstyledLI key={bucketTicker.tickerId}>
          <BucketTicker bucketTicker={bucketTicker} />
        </UnstyledLI>
      ))}
    </UnstyledUL>
  );
}
