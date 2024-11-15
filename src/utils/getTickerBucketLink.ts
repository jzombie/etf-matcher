import { fetchLevenshteinDistance } from "@services/RustService";
import type { TickerBucket } from "@src/store";

export default function getTickerBucketLink(
  tickerBucket: TickerBucket,
): string {
  return `/${tickerBucket.type}s/${tickerBucket.name.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

export async function fetchClosestTickerBucketName(
  candidateBucketName: string,
  tickerBuckets: TickerBucket[],
): Promise<TickerBucket | null> {
  let closestBucket: TickerBucket | null = null;
  let minDistance = Infinity;

  // Calculate Levenshtein distance between the path and each TickerBucket link
  for (const bucket of tickerBuckets) {
    const bucketLink = getTickerBucketLink(bucket);
    const distance = await fetchLevenshteinDistance(
      bucketLink,
      candidateBucketName,
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestBucket = bucket;
    }
  }

  return closestBucket;
}
