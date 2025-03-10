import callRustService, { subscribe } from "./callRustService";
import { fetchAllMajorSectors } from "./lib/allMajorSectors";
import {
  clearCache,
  fetchCacheDetails,
  fetchCacheSize,
  preloadSearchCache,
  removeCacheEntry,
} from "./lib/cache";
import { fetchDataBuildInfo } from "./lib/dataBuildInfo";
import { fetchETFAggregateDetail } from "./lib/etfAggregateDetail";
import {
  fetchETFHoldersAggregateDetail,
  fetchETFHoldingWeight,
  fetchETFHoldings,
} from "./lib/etfHoldings";
import { fetchImageInfo } from "./lib/imageInfo";
import { fetchLevenshteinDistance } from "./lib/levenshteinDistance";
import { generateQRCode } from "./lib/qrCode";
import searchTickers, {
  extractSearchResultsFromText,
} from "./lib/searchTickers";
import {
  fetchTicker10KDetail,
  fetchWeightedTicker10KDetail,
} from "./lib/ticker10KDetail";
import { csvToTickerBuckets, tickerBucketsToCSV } from "./lib/tickerBuckets";
import {
  fetchTickerDetail,
  fetchWeightedTickerSectorDistribution,
} from "./lib/tickerDetail";
import {
  auditMissingTickerVectors,
  fetchAllTickerVectorConfigs,
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
} from "./lib/tickerVector";
import type {
  RustServiceCacheDetail,
  RustServiceCoord2D,
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
  RustServiceTickerSymbol,
  RustServiceTickerVectorConfig,
  RustServiceTickerWeightedSectorDistribution,
  RustServiceTickerWithWeight,
} from "./rustServiceTypes";
import { NotifierEvent } from "./workerMainBindings";

export default callRustService;
export { subscribe };

export { NotifierEvent };
export type {
  RustServiceTickerSymbol,
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
  RustServiceTickerWeightedSectorDistribution,
  RustServiceTickerDistance,
  RustServiceCosineSimilarityResult,
  RustServiceTickerWithWeight,
  RustServiceCoord2D,
};

export {
  removeCacheEntry,
  clearCache,
  fetchAllTickerVectorConfigs,
  auditMissingTickerVectors,
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
  fetchCacheSize,
  fetchCacheDetails,
  fetchDataBuildInfo,
  preloadSearchCache,
  generateQRCode,
  searchTickers,
  extractSearchResultsFromText,
  fetchImageInfo,
  fetchETFHoldings,
  fetchETFHoldingWeight,
  fetchETFHoldersAggregateDetail,
  fetchTickerDetail,
  fetchWeightedTickerSectorDistribution,
  fetchTicker10KDetail,
  fetchWeightedTicker10KDetail,
  fetchETFAggregateDetail,
  fetchAllMajorSectors,
  tickerBucketsToCSV,
  csvToTickerBuckets,
  fetchLevenshteinDistance,
};
