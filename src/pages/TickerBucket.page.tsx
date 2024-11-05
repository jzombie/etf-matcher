import React from "react";

import TickerBucketViewWindowManager from "@components/TickerBucketViewWindowManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

export default function TickerBucketPage() {
  // TODO: Adjust as needed
  usePageTitleSetter("Ticker Bucket");

  // TODO: Adjust as needed
  return <TickerBucketViewWindowManager bucketName="test" />;
}
