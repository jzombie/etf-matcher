import { useCallback, useMemo } from "react";

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
import usePromise from "@hooks/usePromise";

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
  tickerVectorConfigKey: string;
  queryMode: "ticker-detail" | "bucket";
  query: RustServiceTickerDetail | TickerBucket;
};

export default function useTickerVectorQuery({
  tickerVectorConfigKey,
  queryMode,
  query,
}: TickerVectorQueryProps) {
  const { triggerUIError } = useAppErrorBoundary();

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

  const fetchTickerDetailWithETFExpenseRatio = useCallback(
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

  const fetchEuclideanData = useCallback(async () => {
    let items;
    if (queryMode === "ticker-detail") {
      const id = (query as RustServiceTickerDetail).ticker_id;
      items = await fetchEuclideanByTicker(tickerVectorConfigKey, id);
    } else {
      const id = query as TickerBucket;
      items = await fetchEuclideanByTickerBucket(tickerVectorConfigKey, id);
    }
    const detailPromises = items.map(
      async (item: RustServiceTickerDistance) => {
        const detail = await fetchTickerDetailWithETFExpenseRatio(
          item.ticker_id,
        );
        return { ...detail, distance: item.distance };
      },
    );

    return Promise.all(detailPromises);
  }, [
    queryMode,
    query,
    tickerVectorConfigKey,
    fetchTickerDetailWithETFExpenseRatio,
  ]);

  const fetchCosineData = useCallback(async () => {
    let items;
    if (queryMode === "ticker-detail") {
      const id = (query as RustServiceTickerDetail).ticker_id;
      items = await fetchCosineByTicker(tickerVectorConfigKey, id);
    } else {
      const id = query as TickerBucket;
      items = await fetchCosineByTickerBucket(tickerVectorConfigKey, id);
    }

    const detailPromises = items.map(
      async (item: RustServiceCosineSimilarityResult) => {
        const detail = await fetchTickerDetailWithETFExpenseRatio(
          item.ticker_id,
        );
        return { ...detail, cosineSimilarityScore: item.similarity_score };
      },
    );

    return Promise.all(detailPromises);
  }, [
    queryMode,
    query,
    tickerVectorConfigKey,
    fetchTickerDetailWithETFExpenseRatio,
  ]);

  const {
    data: resultsEuclidean,
    isPending: isLoadingEuclidean,
    error: errorEuclidean,
    execute: executeEuclidean,
  } = usePromise<RustServiceTickerDetailWithEuclideanDistance[]>({
    promiseFunction: fetchEuclideanData,
    onLoad: (data) => customLogger.info("Euclidean data loaded", data),
    onError: (error) => {
      customLogger.error(error);

      triggerUIError(new Error("Error when trying to load euclidean data"));
    },
    autoExecute: false,
  });

  const {
    data: resultsCosine,
    isPending: isLoadingCosine,
    error: errorCosine,
    execute: executeCosine,
  } = usePromise<RustServiceTickerDetailWithCosineSimilarity[]>({
    promiseFunction: fetchCosineData,
    onLoad: (data) => customLogger.info("Cosine data loaded", data),
    onError: (error) => {
      customLogger.error(error);

      triggerUIError(new Error("Error when trying to load cosine data"));
    },
    autoExecute: false,
  });

  return {
    queryName,
    //
    fetchEuclidean: executeEuclidean,
    isLoadingEuclidean,
    resultsEuclidean,
    errorEuclidean,
    //
    fetchCosine: executeCosine,
    isLoadingCosine,
    resultsCosine,
    errorCosine,
  };
}
