import { useCallback, useMemo, useState } from "react";

import store from "@src/store";
import type { TickerBucket } from "@src/store";
import type {
  RustServiceCosineSimilarityResult,
  RustServiceTickerDetail,
  RustServiceTickerDistance,
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
    async <T, R, M>(
      fetchFunction: (id: T) => Promise<R[]>,
      mapFunction: (item: R) => Promise<M>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setResults: React.Dispatch<React.SetStateAction<M[]>>,
      setError: React.Dispatch<React.SetStateAction<string | null>>,
      id: T,
    ) => {
      setLoading(true);
      try {
        const items = await fetchFunction(id);
        const detailPromises = items.map(mapFunction);
        const settledDetails = await Promise.allSettled(detailPromises);

        const fulfilledDetails = settledDetails
          .filter(
            (result): result is PromiseFulfilledResult<Awaited<M>> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);

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
    const mapFn = async (item: RustServiceTickerDistance) => {
      const detail = await store.fetchTickerDetail(item.ticker_id);
      return { ...detail, distance: item.distance };
    };

    if (queryMode === "ticker-detail") {
      const fetchFn = store.fetchEuclideanByTicker;
      const tickerId = (query as RustServiceTickerDetail).ticker_id;

      _fetchData(
        fetchFn,
        mapFn,
        _setIsLoadingEuclidean,
        _setResultsEuclidean,
        _setErrorEuclidean,
        tickerId,
      );
    } else {
      const fetchFn = store.fetchEuclideanByTickerBucket;
      const tickerBucket = query as TickerBucket;

      _fetchData(
        fetchFn,
        mapFn,
        _setIsLoadingEuclidean,
        _setResultsEuclidean,
        _setErrorEuclidean,
        tickerBucket,
      );
    }
  }, [queryMode, query, _fetchData]);

  const fetchCosine = useCallback(() => {
    const mapFn = async (item: RustServiceCosineSimilarityResult) => {
      const detail = await store.fetchTickerDetail(item.ticker_id);
      return { ...detail, cosineSimilarityScore: item.similarity_score };
    };

    if (queryMode === "ticker-detail") {
      const fetchFn = store.fetchCosineByTicker;
      const tickerId = (query as RustServiceTickerDetail).ticker_id;

      _fetchData(
        fetchFn,
        mapFn,
        _setIsLoadingCosine,
        _setResultsCosine,
        _setErrorCosine,
        tickerId,
      );
    } else {
      const fetchFn = store.fetchCosineByTickerBucket;
      const tickerBucket = query as TickerBucket;

      _fetchData(
        fetchFn,
        mapFn,
        _setIsLoadingCosine,
        _setResultsCosine,
        _setErrorCosine,
        tickerBucket,
      );
    }
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
