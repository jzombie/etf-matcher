import type { TickerBucket } from "@src/store";

export default function getTickerBucketLink(
  tickerBucket: TickerBucket,
): string {
  return `/${tickerBucket.type}s/${tickerBucket.name.trim().toLowerCase().replace(/\s+/g, "-")}`;
}
