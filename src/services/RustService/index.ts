import callRustService, { subscribe } from "./callRustService";
import {
  clearCache,
  fetchCacheDetails,
  fetchCacheSize,
  preloadSearchCache,
  removeCacheEntry,
} from "./lib/cache";
import {
  fetchETFHoldersAggregateDetail,
  fetchETFHoldingWeight,
  fetchETFHoldings,
} from "./lib/etfHoldings";
import fetchAllMajorSectors from "./lib/fetchAllMajorSectors";
import fetchDataBuildInfo from "./lib/fetchDataBuildInfo";
import fetchETFAggregateDetail from "./lib/fetchETFAggregateDetail";
import fetchImageInfo from "./lib/fetchImageInfo";
import fetchLevenshteinDistance from "./lib/fetchLevenshteinDistance";
import fetchSymbolAndExchange from "./lib/fetchSymbolAndExchange";
import fetchTicker10KDetail from "./lib/fetchTicker10KDetail";
import fetchTickerDetail from "./lib/fetchTickerDetail";
import fetchTickerId from "./lib/fetchTickerId";
import generateQRCode from "./lib/generateQRCode";
import searchTickers from "./lib/searchTickers";
import { csvToTickerBuckets, tickerBucketsToCSV } from "./lib/tickerBuckets";
import {
  fetchAllTickerVectorConfigs,
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
  RustServiceETFHoldingTicker,
  RustServiceETFHoldingWeight,
  RustServiceImageInfo,
  RustServicePaginatedResults,
  RustServiceTicker10KDetail,
  RustServiceTickerDetail,
  RustServiceTickerDistance,
  RustServiceTickerSearchResult,
  RustServiceTickerVectorConfig,
  RustServiceTickerWithQuantity,
} from "./rustServiceTypes";
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
  RustServiceETFHoldingWeight,
  RustServiceETFHoldingTicker,
  RustServiceCacheDetail,
  RustServiceImageInfo,
  RustServiceTickerVectorConfig,
  RustServiceTickerDistance,
  RustServiceCosineSimilarityResult,
  RustServiceTickerWithQuantity,
};

export {
  removeCacheEntry,
  clearCache,
  fetchAllTickerVectorConfigs,
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
  fetchETFHoldings,
  fetchETFHoldingWeight,
  fetchETFHoldersAggregateDetail,
  fetchTickerDetail,
  fetchTicker10KDetail,
  fetchSymbolAndExchange,
  fetchETFAggregateDetail,
  fetchAllMajorSectors,
  tickerBucketsToCSV,
  csvToTickerBuckets,
  fetchLevenshteinDistance,
};
