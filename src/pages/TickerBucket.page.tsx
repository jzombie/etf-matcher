import React, { useEffect } from "react";

import { fetchLevenshteinDistance } from "@services/RustService";
import { useLocation, useParams } from "react-router-dom";

import TickerBucketViewWindowManager from "@components/TickerBucketViewWindowManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";
import useStoreStateReader from "@hooks/useStoreStateReader";

export type TickerBucketPageProps = {
  bucketType: "portfolio" | "watchlist";
};

export default function TickerBucketPage({
  bucketType,
}: TickerBucketPageProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

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

    // TODO: Determine which ticker bucket to use from the provided bucket type and name; if the bucket name is not determinable, perhaps navigate back to the buckets page of type?
    // TODO: Use Rust Levenshtein distance to determine the closest match to the bucket name
    console.log("Ticker Buckets:", tickerBuckets);

    (async () => {
      if (bucketName) {
        let closestBucket = null;
        let minDistance = Infinity;

        for (const bucket of tickerBuckets) {
          if (bucket.type !== bucketType) {
            continue;
          }

          const distance = await fetchLevenshteinDistance(
            bucket.name,
            bucketName,
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestBucket = bucket;
          }
        }

        if (closestBucket) {
          console.log("Closest Bucket:", closestBucket);
        } else {
          console.log("No matching bucket found");
        }
      }
    })();
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
