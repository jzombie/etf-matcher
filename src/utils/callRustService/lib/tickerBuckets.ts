import { TickerBucket } from "@src/store";

import customLogger from "@utils/customLogger";

import callRustService from "../callRustService";

export async function tickerBucketsToCSV(
  tickerBuckets: TickerBucket[],
): Promise<string> {
  customLogger.debug({ tickerBuckets });

  const jsonTickerBuckets = JSON.stringify(tickerBuckets);

  return callRustService<string>("ticker_buckets_to_csv", [jsonTickerBuckets]);
}

// TODO: Implement
// export async function csvToTickerBuckets(csv: string) {
// }
