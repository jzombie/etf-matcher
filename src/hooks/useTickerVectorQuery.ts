import { useCallback, useMemo, useState } from "react";

import store from "@src/store";
import type { TickerBucket } from "@src/store";
import type {
  RustServiceCosineSimilarityResult,
  RustServiceTickerDetail,
} from "@src/types";

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
        throw new Error(`Unhandled queryMode: ${queryMode}`);
    }
  }, [queryMode, query]);

  // Utility function to handle common fetching logic
  const _fetchData = useCallback(
    async <T, R>(
      fetchFunction: (id: T) => Promise<R[]>,
      mapFunction: (item: R) => Promise<any>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setResults: React.Dispatch<React.SetStateAction<any[]>>,
      setError: React.Dispatch<React.SetStateAction<string | null>>,
      id: T,
    ) => {
      setLoading(true);
      try {
        const items = await fetchFunction(id);
        const detailPromises = items.map(mapFunction);
        const settledDetails = await Promise.allSettled(detailPromises);

        const fulfilledDetails = settledDetails
          .filter((result) => result.status === "fulfilled")
          .map((result) => (result as PromiseFulfilledResult<any>).value);

        setResults(fulfilledDetails);
      } catch (error) {
        customLogger.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchEuclidean = useCallback(() => {
    const fetchFn =
      queryMode === "ticker-detail"
        ? store.fetchClosestTickers
        : store.fetchClosestTickersByQuantity;

    const mapFn = async (item: TickerVectorWithEuclideanDistance) => {
      const detail = await store.fetchTickerDetail(item.ticker_id);
      return { ...detail, distance: item.distance };
    };

    const id =
      queryMode === "ticker-detail"
        ? (query as RustServiceTickerDetail).ticker_id
        : (query as TickerBucket);

    _fetchData(
      fetchFn,
      mapFn,
      _setIsLoadingEuclidean,
      _setResultsEuclidean,
      _setErrorEuclidean,
      id,
    );
  }, [queryMode, query, _fetchData]);

  const fetchCosine = useCallback(() => {
    const fetchFn =
      queryMode === "ticker-detail"
        ? store.fetchRankedTickersByCosineSimilarity
        : store.fetchRankedTickersByQuantityCosineSimilarity;

    const mapFn = async (item: RustServiceCosineSimilarityResult) => {
      const detail = await store.fetchTickerDetail(item.ticker_id);
      return { ...detail, cosineSimilarityScore: item.similarity_score };
    };

    const id =
      queryMode === "ticker-detail"
        ? (query as RustServiceTickerDetail).ticker_id
        : (query as TickerBucket);

    _fetchData(
      fetchFn,
      mapFn,
      _setIsLoadingCosine,
      _setResultsCosine,
      _setErrorCosine,
      id,
    );
  }, [queryMode, query, _fetchData]);

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
