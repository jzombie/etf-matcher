import React from "react";

export type TickerBucketViewWindowManagerProps = {
  bucketName: string;
};

export default function TickerBucketViewWindowManager({
  bucketName,
}: TickerBucketViewWindowManagerProps) {
  return <div>TickerBucketViewWindowManager: {bucketName}</div>;
}
