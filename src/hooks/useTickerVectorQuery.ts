import { useCallback, useMemo, useState } from "react";

import type {
  RustServiceCosineSimilarityResult,
  RustServiceTickerDetail,
  RustServiceTickerDistance,
} from "@services/RustService";
import {
  fetchCosineByTicker,
  fetchCosineByTickerBucket,
  fetchETFAggregateDetail,
  fetchEuclideanByTicker,
  fetchEuclideanByTickerBucket,
  fetchTickerDetail,
} from "@services/RustService";
import type { TickerBucket } from "@src/store";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";

import customLogger from "@utils/customLogger";

type RustServiceTickerDetailWithETFExpenseRatio = RustServiceTickerDetail & {
  etf_expense_ratio: number | null;
};

export type RustServiceTickerDetailWithEuclideanDistance =
  RustServiceTickerDetailWithETFExpenseRatio & {
    distance: number;
  };

export type RustServiceTickerDetailWithCosineSimilarity =
  RustServiceTickerDetailWithETFExpenseRatio & {
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
  const { triggerUIError } = useAppErrorBoundary();

  const [isLoadingEuclidean, _setIsLoadingEuclidean] = useState(false);
  const [resultsEuclidean, _setResultsEuclidean] = useState<
    RustServiceTickerDetailWithEuclideanDistance[]
  >([]);
  const [errorEuclidean, _setErrorEuclidean] = useState<string | null>(null);

  const [isLoadingCosine, _setIsLoadingCosine] = useState(false);
  const [resultsCosine, _setResultsCosine] = useState<
    RustServiceTickerDetailWithCosineSimilarity[]
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
        const uiErrorMessage = "Error fetching vector query data";

        triggerUIError(new Error(uiErrorMessage));
        customLogger.error(error);
        setError(uiErrorMessage);
      } finally {
        setLoading(false);
      }
    },
    [triggerUIError],
  );

  const fetchTickerDetailWithETFExpenseRatio: (
    tickerId: number,
  ) => Promise<RustServiceTickerDetailWithETFExpenseRatio> = useCallback(
    async (tickerId: number) => {
      const tickerDetail = await fetchTickerDetail(tickerId);
      let etf_expense_ratio = null;

      if (tickerDetail.is_etf) {
        const { expense_ratio } = await fetchETFAggregateDetail(tickerId);
        etf_expense_ratio = expense_ratio;
      }

      return { ...tickerDetail, etf_expense_ratio };
    },
    [],
  );

  const fetchEuclidean = useCallback(() => {
    const mapFn = async (item: RustServiceTickerDistance) => {
      const detail = await fetchTickerDetailWithETFExpenseRatio(item.ticker_id);

      return { ...detail, distance: item.distance };
    };

    if (queryMode === "ticker-detail") {
      const fetchFn = fetchEuclideanByTicker;
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
      const fetchFn = fetchEuclideanByTickerBucket;
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
  }, [queryMode, fetchTickerDetailWithETFExpenseRatio, query, _fetchData]);

  const fetchCosine = useCallback(() => {
    const mapFn = async (item: RustServiceCosineSimilarityResult) => {
      const detail = await fetchTickerDetailWithETFExpenseRatio(item.ticker_id);

      return {
        ...detail,
        cosineSimilarityScore: item.similarity_score,
      };
    };

    if (queryMode === "ticker-detail") {
      const fetchFn = fetchCosineByTicker;
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
      const fetchFn = fetchCosineByTickerBucket;
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
  }, [queryMode, fetchTickerDetailWithETFExpenseRatio, query, _fetchData]);

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
