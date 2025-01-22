import { TickerBucket } from "@src/store";

import callRustService from "../callRustService";

export async function tickerBucketsToCSV(
  tickerBuckets: TickerBucket[],
): Promise<string> {
  const jsonTickerBuckets = JSON.stringify(tickerBuckets);

  // TODO: REmove
  console.log({ jsonTickerBuckets });

  return callRustService<string>("ticker_buckets_to_csv", [jsonTickerBuckets]);
}

export async function csvToTickerBuckets(csv: string): Promise<TickerBucket[]> {
  return callRustService<TickerBucket[]>("csv_to_ticker_buckets", [csv]);
}
