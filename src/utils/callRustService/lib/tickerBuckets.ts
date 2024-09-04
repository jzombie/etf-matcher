import store, { TickerBucket } from "@src/store";

import callRustService from "../callRustService";

// TODO: Use correct generic type
// TODO: Use buffer for CSV
export async function tickerBucketsToCSV(tickerBuckets?: TickerBucket[]) {
  if (!tickerBuckets) {
    tickerBuckets = store.state.tickerBuckets;
  }

  const jsonTickerBuckets = JSON.stringify(tickerBuckets);

  return callRustService("ticker_buckets_to_csv", [jsonTickerBuckets]);
}

// TODO: Use buffer for CSV
// export async function csvToTickerBuckets(csv: string) {
// }
