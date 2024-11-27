import { fetchLevenshteinDistance } from "@services/RustService";
import type { TickerBucket } from "@src/store";

export function getTickerBucketLink(tickerBucket: TickerBucket): string {
  const sanitizedBucketName = tickerBucket.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Encode the name to handle special characters like '/'
  return `/${tickerBucket.type}s/${encodeURIComponent(sanitizedBucketName)}`;
}

// TODO: Implement max distance threshold
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

export function formatTickerBucketPageTitle(
  tickerBucket: TickerBucket,
): string {
  const { name, type } = tickerBucket;

  // Check if the name already ends with the type (case-insensitive)
  const shouldOmitType = name.trim().toLowerCase().endsWith(type.toLowerCase());

  // Capitalize the first letter of the type
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  // Return the formatted title
  return shouldOmitType ? name : `${name} ${capitalizedType}`;
}
