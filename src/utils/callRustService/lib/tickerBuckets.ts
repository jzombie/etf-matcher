import store, { TickerBucket } from "@src/store";

import customLogger from "@utils/customLogger";

import callRustService from "../callRustService";

// TODO: Use correct generic type
// TODO: Use buffer for CSV
export async function tickerBucketsToCSV(tickerBuckets?: TickerBucket[]) {
  if (!tickerBuckets) {
    tickerBuckets = store.state.tickerBuckets;
  }

  customLogger.debug({ tickerBuckets });

  const jsonTickerBuckets = JSON.stringify(tickerBuckets);

  return callRustService("ticker_buckets_to_csv", [jsonTickerBuckets]);
}

// TODO: Use buffer for CSV
// export async function csvToTickerBuckets(csv: string) {
// }
