import callRustService, { subscribe } from "./callRustService";
import clearCache from "./lib/clearCache";
import {
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
} from "./lib/fetchCosine";
import {
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
} from "./lib/fetchEuclidean";
import removeCacheEntry from "./lib/removeCacheEntry";
import type {
  RustServiceCacheDetail,
  RustServiceCosineSimilarityResult,
  RustServiceDataBuildInfo,
  RustServiceETFAggregateDetail,
  RustServiceETFHoldingTickerResponse,
  RustServiceETFHoldingWeightResponse,
  RustServiceImageInfo,
  RustServicePaginatedResults,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
  RustServiceTickerDistance,
  RustServiceTickerSearchResult,
} from "./types";
import { NotifierEvent } from "./workerMainBindings";

export default callRustService;
export { subscribe };

export { NotifierEvent };
export type {
  RustServiceDataBuildInfo,
  RustServicePaginatedResults,
  RustServiceTickerSearchResult,
  RustServiceTickerDetail,
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
  RustServiceETFHoldingWeightResponse,
  RustServiceETFHoldingTickerResponse,
  RustServiceCacheDetail,
  RustServiceImageInfo,
  RustServiceTickerDistance,
  RustServiceCosineSimilarityResult,
};

export {
  removeCacheEntry,
  clearCache,
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
};
