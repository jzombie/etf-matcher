import { useCallback, useMemo, useState } from "react";

import store from "@src/store";
import type { TickerBucket } from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import customLogger from "@utils/customLogger";

// TODO: Rename
export type TickerVectorWithEuclideanDistance = RustServiceTickerDetail & {
  distance: number;
};

// TODO: Rename
export type TickerVectorWithCosineSimilarityScore = RustServiceTickerDetail & {
  cosineSimilarityScore: number;
};

export type TickerVectorQueryProps = {
  queryMode: "ticker-detail" | "bucket";
  query: RustServiceTickerDetail | TickerBucket;
};

export default function useTickerVectorQuery({
  queryMode,
  query,
}: TickerVectorQueryProps) {
  const [isLoadingEuclidean, _setIsLoadingEuclidean] = useState(false);
  const [errorEuclidean, _setErrorEuclidean] = useState(null);

  const [isLoadingCosine, _setIsLoadingCosine] = useState(false);
  const [errorCosine, _setErrorCosine] = useState(null);

  const queryName = useMemo(() => {
    switch (queryMode) {
      case "ticker-detail":
        return (query as RustServiceTickerDetail).symbol;

      case "bucket":
        return (query as TickerBucket).name;

      default:
        throw new Error(`Unhanded queryMode: ${queryMode}`);
    }
  }, [queryMode, query]);

  const fetchEuclidean = useCallback(() => {
    // TODO: Fetch based on query mode
    if (queryMode === "ticker-detail") {
      _setIsLoadingEuclidean(true);

      const tickerId = (query as RustServiceTickerDetail).ticker_id;

      store
        .fetchClosestTickers(tickerId)
        .then(async (closestTickers) => {
          const detailPromises = closestTickers.map((item) =>
            store.fetchTickerDetail(item.ticker_id).then((detail) => ({
              ...detail,
              distance: item.distance,
            })),
          );
          const settledDetails = await Promise.allSettled(detailPromises);

          const fulfilledDetails = settledDetails
            .filter((result) => result.status === "fulfilled")
            .map(
              (result) =>
                (
                  result as PromiseFulfilledResult<TickerVectorWithEuclideanDistance>
                ).value,
            );

          _setErrorEuclidean(fulfilledDetails);
        })
        .catch((error) => {
          customLogger.error("Error fetching closest tickers:", error);

          _setErrorEuclidean("Error fetching closest tickers");
        })
        .finally(() => {
          _setIsLoadingEuclidean(false);
        });
    } else {
      throw new Error("TODO: Handle bucket Euclidean query");
    }
  }, [queryMode, query]);

  const fetchCosine = useCallback(() => {
    if (queryMode === "ticker-detail") {
      _setIsLoadingCosine(true);

      const tickerId = (query as RustServiceTickerDetail).ticker_id;

      store
        .fetchRankedTickersByCosineSimilarity(tickerId)
        .then(async (similarTickers) => {
          const detailPromises = similarTickers.map((item) =>
            store.fetchTickerDetail(item.ticker_id).then((detail) => ({
              ...detail,
              cosineSimilarityScore: item.similarity_score,
            })),
          );
          const settledDetails = await Promise.allSettled(detailPromises);

          const fulfilledDetails = settledDetails
            .filter((result) => result.status === "fulfilled")
            .map(
              (result) =>
                (
                  result as PromiseFulfilledResult<TickerVectorWithCosineSimilarityScore>
                ).value,
            );

          _setErrorCosine(fulfilledDetails);
        })
        .catch((error) => {
          customLogger.error("Error fetching similar tickers:", error);

          _setErrorCosine("Error fetching similar tickers");
        })
        .finally(() => {
          _setIsLoadingCosine(false);
        });
    } else {
      throw new Error("TODO: Handle bucket Cosine query");
    }
  }, [queryMode, query]);

  return {
    queryName,
    fetchEuclidean,
    fetchCosine,
    isLoadingEuclidean,
    errorEuclidean,
    isLoadingCosine,
    errorCosine,
  };
}
