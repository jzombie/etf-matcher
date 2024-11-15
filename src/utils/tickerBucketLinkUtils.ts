import { fetchLevenshteinDistance } from "@services/RustService";
import type { TickerBucket } from "@src/store";

export function getTickerBucketLink(tickerBucket: TickerBucket): string {
  return `/${tickerBucket.type}s/${tickerBucket.name.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

export async function fetchClosestTickerBucketName(
  candidateBucketName: string,
  bucketType: string,
  tickerBuckets: TickerBucket[],
): Promise<TickerBucket | null> {
  let closestBucket: TickerBucket | null = null;
  let minDistance = Infinity;

  const filteredTickerBuckets = tickerBuckets.filter(
    (bucket) => bucket.type === bucketType,
  );

  // Calculate Levenshtein distance between the path and each TickerBucket link
  for (const bucket of filteredTickerBuckets) {
    const distance = await fetchLevenshteinDistance(
      candidateBucketName,
      bucket.name,
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestBucket = bucket;
    }
  }

  return closestBucket;
}
