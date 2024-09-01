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
  const [resultsEuclidean, _setResultsEuclidean] = useState<
    TickerVectorWithEuclideanDistance[]
  >([]);
  const [errorEuclidean, _setErrorEuclidean] = useState<string | null>(null);

  const [isLoadingCosine, _setIsLoadingCosine] = useState(false);
  const [resultsCosine, _setResultsCosine] = useState<
    TickerVectorWithCosineSimilarityScore[]
  >([]);
  const [errorCosine, _setErrorCosine] = useState<string | null>(null);

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
    // TODO: Combine `fulfilledDetails` handling for all query modes

    switch (queryMode) {
      case "ticker-detail":
        return (() => {
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

              _setResultsEuclidean(fulfilledDetails);
            })
            .catch((error) => {
              customLogger.error("Error fetching closest tickers:", error);

              _setErrorEuclidean("Error fetching closest tickers");
            })
            .finally(() => {
              _setIsLoadingEuclidean(false);
            });
        })();

      case "bucket":
        return (() => {
          _setIsLoadingEuclidean(true);

          const tickerBucket = query as TickerBucket;

          store
            .fetchClosestTickersByQuantity(tickerBucket)
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

              _setResultsEuclidean(fulfilledDetails);
            })
            .catch((error) => {
              customLogger.error("Error fetching closest tickers:", error);

              _setErrorEuclidean("Error fetching closest tickers");
            })
            .finally(() => {
              _setIsLoadingEuclidean(false);
            });
        })();

      default:
        throw new Error(`Unhanded queryMode: ${queryMode}`);
    }
  }, [queryMode, query]);

  const fetchCosine = useCallback(() => {
    // TODO: Combine `fulfilledDetails` handling for all query modes

    switch (queryMode) {
      case "ticker-detail":
        return (() => {
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

              _setResultsCosine(fulfilledDetails);
            })
            .catch((error) => {
              customLogger.error("Error fetching similar tickers:", error);

              _setErrorCosine("Error fetching similar tickers");
            })
            .finally(() => {
              _setIsLoadingCosine(false);
            });
        })();

      default:
        throw new Error(`Unhanded queryMode: ${queryMode}`);
    }
  }, [queryMode, query]);

  return {
    queryName,
    //
    fetchEuclidean,
    isLoadingEuclidean,
    resultsEuclidean,
    errorEuclidean,
    //
    fetchCosine,
    isLoadingCosine,
    resultsCosine,
    errorCosine,
  };
}
