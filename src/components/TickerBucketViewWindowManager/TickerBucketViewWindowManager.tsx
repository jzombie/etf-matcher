import React from "react";

export type TickerBucketViewWindowManagerProps = {
  bucketType: "portfolio" | "watchlist";
  bucketName: string;
};

export default function TickerBucketViewWindowManager({
  bucketType,
  bucketName,
}: TickerBucketViewWindowManagerProps) {
  return (
    <div>
      TickerBucketViewWindowManager: {bucketType}:{bucketName}
    </div>
  );
}
