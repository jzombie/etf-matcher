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
        return (query as RustServiceTickerDetail).ticker_symbol;
      case "bucket":
        return (query as TickerBucket).name;
      default:
        throw new Error(`Unhandled queryMode: ${queryMode}`);
    }
  }, [queryMode, query]);

  const fetchTickerDetailWithETFExpenseRatio = useCallback(
    async (tickerSymbol: string) => {
      const tickerDetail = await fetchTickerDetail(tickerSymbol);
      let etf_expense_ratio = null;

      if (tickerDetail.is_etf) {
        const { expense_ratio } = await fetchETFAggregateDetail(tickerSymbol);
        etf_expense_ratio = expense_ratio;
      }

      return { ...tickerDetail, etf_expense_ratio };
    },
    [],
  );

  const fetchEuclideanData = useCallback(async () => {
    let items;
    if (queryMode === "ticker-detail") {
      const tickerSymbol = (query as RustServiceTickerDetail).ticker_symbol;
      items = await fetchEuclideanByTicker(tickerVectorConfigKey, tickerSymbol);
    } else {
      const tickerBucket = query as TickerBucket;
      items = await fetchEuclideanByTickerBucket(
        tickerVectorConfigKey,
        tickerBucket,
      );
    }

    // Fetch each detail and add distance, catching errors on a per-item basis
    const detailPromises = items.map(
      async (item: RustServiceTickerDistance) => {
        try {
          const detail = await fetchTickerDetailWithETFExpenseRatio(
            item.ticker_symbol,
          );
          return {
            ...detail,
            distance: item.distance,
          } as RustServiceTickerDetailWithEuclideanDistance;
        } catch (error) {
          customLogger.error("Error fetching Euclidean detail", error);
          return null; // Mark as null if there was an error
        }
      },
    );

    // Await allSettled, filter out nulls, and narrow types for only fulfilled results
    const results = await Promise.allSettled(detailPromises);
    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<RustServiceTickerDetailWithEuclideanDistance> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value);
  }, [
    queryMode,
    query,
    tickerVectorConfigKey,
    fetchTickerDetailWithETFExpenseRatio,
  ]);

  const fetchCosineData = useCallback(async () => {
    let items;
    if (queryMode === "ticker-detail") {
      const tickerSymbol = (query as RustServiceTickerDetail).ticker_symbol;
      items = await fetchCosineByTicker(tickerVectorConfigKey, tickerSymbol);
    } else {
      const tickerBucket = query as TickerBucket;
      items = await fetchCosineByTickerBucket(
        tickerVectorConfigKey,
        tickerBucket,
      );
    }

    // Fetch each detail and add cosine similarity, catching errors on a per-item basis
    const detailPromises = items.map(
      async (item: RustServiceCosineSimilarityResult) => {
        try {
          const detail = await fetchTickerDetailWithETFExpenseRatio(
            item.ticker_symbol,
          );
          return {
            ...detail,
            cosineSimilarityScore: item.similarity_score,
          } as RustServiceTickerDetailWithCosineSimilarity;
        } catch (error) {
          customLogger.error("Error fetching Cosine detail", error);
          return null; // Mark as null if there was an error
        }
      },
    );

    // Await allSettled, filter out nulls, and narrow types for only fulfilled results
    const results = await Promise.allSettled(detailPromises);
    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<RustServiceTickerDetailWithCosineSimilarity> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value);
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
    fn: fetchEuclideanData,
    onError: (error) => {
      customLogger.error(error);

      triggerUIError(new Error("Error when trying to load euclidean data"));
    },
    initialAutoExecute: false,
  });

  const {
    data: resultsCosine,
    isPending: isLoadingCosine,
    error: errorCosine,
    execute: executeCosine,
  } = usePromise<RustServiceTickerDetailWithCosineSimilarity[]>({
    fn: fetchCosineData,
    onError: (error) => {
      customLogger.error(error);

      triggerUIError(new Error("Error when trying to load cosine data"));
    },
    initialAutoExecute: false,
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
