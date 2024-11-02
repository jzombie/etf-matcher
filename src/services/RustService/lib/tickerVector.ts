import type { TickerBucket } from "@src/store";

import callRustService from "../callRustService";
import type {
  RustServiceCosineSimilarityResult,
  RustServiceTickerDistance,
  RustServiceTickerVectorConfig,
} from "../types";
import tickerBucketToTickersWithQuantity from "../utils/tickerBucketToTickersWithQuantity";

type RawTickerVectorConfig = Omit<
  RustServiceTickerVectorConfig,
  "last_training_time"
> & {
  // "Over-the-wire" format
  last_training_time: string;
};

export async function fetchAllTickerVectorConfigs(): Promise<
  RustServiceTickerVectorConfig[]
> {
  const configs = await callRustService<RawTickerVectorConfig[]>(
    "get_all_ticker_vector_configs",
    [],
  );

  // Convert `last_training_time` to Date objects
  return configs.map((config) => ({
    ...config,
    last_training_time: new Date(config.last_training_time),
  }));
}

export async function fetchCosineByTicker(
  tickerVectorConfigKey: string,
  tickerId: number,
): Promise<RustServiceCosineSimilarityResult[]> {
  return callRustService<RustServiceCosineSimilarityResult[]>(
    "get_cosine_by_ticker",
    [tickerVectorConfigKey, tickerId],
  );
}

export async function fetchCosineByTickerBucket(
  tickerVectorConfigKey: string,
  tickerBucket: TickerBucket,
): Promise<RustServiceCosineSimilarityResult[]> {
  const rustServiceTickersWithQuantity =
    tickerBucketToTickersWithQuantity(tickerBucket);

  return callRustService("get_cosine_by_ticker_bucket", [
    tickerVectorConfigKey,
    rustServiceTickersWithQuantity,
  ]);
}

export async function fetchEuclideanByTicker(
  tickerVectorConfigKey: string,
  tickerId: number,
): Promise<RustServiceTickerDistance[]> {
  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker",
    [tickerVectorConfigKey, tickerId],
  );
}

export async function fetchEuclideanByTickerBucket(
  tickerVectorConfigKey: string,
  tickerBucket: TickerBucket,
): Promise<RustServiceTickerDistance[]> {
  const rustServiceTickersWithQuantity =
    tickerBucketToTickersWithQuantity(tickerBucket);

  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker_bucket",
    [tickerVectorConfigKey, rustServiceTickersWithQuantity],
  );
}
