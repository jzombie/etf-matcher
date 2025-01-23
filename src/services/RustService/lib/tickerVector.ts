import type { TickerBucket } from "@src/store";

import callRustService from "../callRustService";
import type {
  RustServiceCosineSimilarityResult,
  RustServiceTickerDistance,
  RustServiceTickerSymbol,
  RustServiceTickerVectorConfig,
} from "../rustServiceTypes";
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

// Used for "audit mode"
export async function auditMissingTickerVectors(
  tickerVectorConfigKey: string,
  tickerSymbols: RustServiceTickerSymbol[],
): Promise<RustServiceTickerSymbol[]> {
  return callRustService<RustServiceTickerSymbol[]>(
    "audit_missing_ticker_vectors",
    [tickerVectorConfigKey, tickerSymbols],
  );
}

export async function fetchCosineByTicker(
  tickerVectorConfigKey: string,
  tickerSymbol: RustServiceTickerSymbol,
): Promise<RustServiceCosineSimilarityResult[]> {
  return callRustService<RustServiceCosineSimilarityResult[]>(
    "get_cosine_by_ticker",
    [tickerVectorConfigKey, tickerSymbol],
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
  tickerSymbol: RustServiceTickerSymbol,
): Promise<RustServiceTickerDistance[]> {
  return callRustService<RustServiceTickerDistance[]>(
    "get_euclidean_by_ticker",
    [tickerVectorConfigKey, tickerSymbol],
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
