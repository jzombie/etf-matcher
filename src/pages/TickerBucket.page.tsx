import React, { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import TickerBucketViewWindowManager from "@components/TickerBucketViewWindowManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";

export type TickerBucketPageProps = {
  bucketType: "portfolio" | "watchlist";
};

export default function TickerBucketPage({
  bucketType,
}: TickerBucketPageProps) {
  // Set the page title
  usePageTitleSetter("Ticker Bucket");

  // Get the current location object
  const location = useLocation();

  // Extract parameters from the URL
  const { bucketName } = useParams<{
    bucketType: string;
    bucketName: string;
  }>();

  // Log the location object and extracted parameters
  useEffect(() => {
    console.log("Current location:", location);
    console.log("Bucket Type:", bucketType);
    console.log("Bucket Name:", bucketName);
  }, [location, bucketType, bucketName]);

  if (!bucketName) {
    return <div>No bucket name provided</div>;
  }

  return (
    <TickerBucketViewWindowManager
      bucketType={bucketType}
      bucketName={bucketName}
    />
  );
}
