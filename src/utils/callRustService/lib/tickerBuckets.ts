import { TickerBucket } from "@src/store";

import callRustService from "../callRustService";

export async function tickerBucketsToCSV(
  tickerBuckets: TickerBucket[],
): Promise<string> {
  const jsonTickerBuckets = JSON.stringify(tickerBuckets);

  return callRustService<string>("ticker_buckets_to_csv", [jsonTickerBuckets]);
}

export async function csvToTickerBuckets(csv: string) {
  // TODO: Handle proper return type
  return callRustService("csv_to_ticker_buckets", [csv]);
}
