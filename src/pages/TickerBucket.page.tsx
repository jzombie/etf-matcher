import React, { useEffect, useState } from "react";

import { fetchLevenshteinDistance } from "@services/RustService";
import type { TickerBucket } from "@src/store";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import TickerBucketViewWindowManager from "@components/TickerBucketViewWindowManager";

import usePageTitleSetter from "@hooks/usePageTitleSetter";
import useStoreStateReader from "@hooks/useStoreStateReader";

import customLogger from "@utils/customLogger";
import setPageTitle from "@utils/setPageTitle";

export type TickerBucketPageProps = {
  bucketType: "portfolio" | "watchlist";
};

export default function TickerBucketPage({
  bucketType,
}: TickerBucketPageProps) {
  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const [selectedTickerBucket, setSelectedTickerBucket] =
    useState<TickerBucket | null>(null);

  const navigate = useNavigate();

  // Set the page title
  usePageTitleSetter("Determining Bucket...");

  // Get the current location object
  const location = useLocation();

  // Extract parameters from the URL
  const { bucketName } = useParams<{
    bucketType: string;
    bucketName: string;
  }>();

  // Log the location object and extracted parameters
  useEffect(() => {
    // TODO: Remove this
    customLogger.log("Current location:", location);
    customLogger.log("Bucket Type:", bucketType);
    customLogger.log("Bucket Name:", bucketName);
    customLogger.log("Ticker Buckets:", tickerBuckets);

    // TODO: Refactor
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
          // TODO: Remove
          customLogger.log("Closest Bucket:", closestBucket);

          setPageTitle(`${closestBucket.name} (${bucketType})`);
          setSelectedTickerBucket(closestBucket);

          // TODO: Re-update the URL to match the bucket
        } else {
          // TODO: Remove
          customLogger.log("No matching bucket found");

          // TODO: Navigate back to the buckets page of the appropriate type
          navigate(`/${bucketType}s`);
        }
      }
    })();
  }, [location, bucketType, bucketName, tickerBuckets, navigate]);

  if (!selectedTickerBucket) {
    return <div>Locating ticker bucket...</div>;
  }

  return <TickerBucketViewWindowManager tickerBucket={selectedTickerBucket} />;
}
