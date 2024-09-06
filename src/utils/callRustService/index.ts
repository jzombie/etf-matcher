import callRustService, { subscribe } from "./callRustService";
import {
  clearCache,
  fetchCacheDetails,
  fetchCacheSize,
  preloadSearchCache,
  removeCacheEntry,
} from "./lib/cache";
import {
  fetchETFHoldersAggregateDetailByTickerId,
  fetchETFHoldingWeight,
  fetchETFHoldingsByETFTickerId,
} from "./lib/etfHoldings";
import fetchDataBuildInfo from "./lib/fetchDataBuildInfo";
import fetchETFAggregateDetailByTickerId from "./lib/fetchETFAggregateDetailByTickerId";
import fetchImageInfo from "./lib/fetchImageInfo";
import fetchSymbolAndExchangeByTickerId from "./lib/fetchSymbolAndExchangeByTickerId";
import fetchTicker10KDetail from "./lib/fetchTicker10KDetail";
import fetchTickerDetail from "./lib/fetchTickerDetail";
import fetchTickerId from "./lib/fetchTickerId";
import generateQRCode from "./lib/generateQRCode";
import getAllMajorSectors from "./lib/getAllMajorSectors";
import searchTickers from "./lib/searchTickers";
import {
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
} from "./lib/tickerVector";
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
  RustServiceTickerWithQuantity,
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
  RustServiceTickerWithQuantity,
};

export {
  removeCacheEntry,
  clearCache,
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
  fetchCacheSize,
  fetchCacheDetails,
  fetchTickerId,
  fetchDataBuildInfo,
  preloadSearchCache,
  generateQRCode,
  searchTickers,
  fetchImageInfo,
  fetchETFHoldingsByETFTickerId,
  fetchETFHoldingWeight,
  fetchETFHoldersAggregateDetailByTickerId,
  fetchTickerDetail,
  fetchTicker10KDetail,
  fetchSymbolAndExchangeByTickerId,
  fetchETFAggregateDetailByTickerId,
  getAllMajorSectors,
};
