import { useEffect } from "react";

import type { RustServiceETFAggregateDetail } from "@services/RustService";
import { fetchETFAggregateDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useMultiETFAggregateDetail(
  etfTickerSymbols: string[] = [],
  onLoad?: (etfAggregateDetails: RustServiceETFAggregateDetail[]) => void,
) {
  const { triggerUIError } = useAppErrorBoundary();

  const fetchDetails = async (
    etfTickerSymbols: string[],
  ): Promise<RustServiceETFAggregateDetail[]> => {
    const results = await Promise.allSettled(
      etfTickerSymbols.map((etfTickerSymbol) =>
        fetchETFAggregateDetail(etfTickerSymbol).catch((err) => {
          customLogger.error({ etfTickerSymbol, err });
          return { status: "rejected", reason: err };
        }),
      ),
    );

    const fulfilledResults = results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<RustServiceETFAggregateDetail> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const rejectedResults = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )
      .map((result) => {
        customLogger.error({ reason: result.reason });
        throw new Error(
          `Error fetching ETF aggregate detail: ${result.reason}`,
        );
      });

    if (rejectedResults.length > 0) {
      throw new Error("Some ETF aggregate details could not be fetched.");
    }

    return fulfilledResults;
  };

  const {
    data: multiETFAggregateDetails,
    isPending: isLoading,
    error,
    execute,
    reset,
  } = usePromise<RustServiceETFAggregateDetail[], [string[]]>({
    fn: fetchDetails,
    onSuccess: onLoad,
    onError: triggerUIError,
    initialAutoExecute: false,
  });

  // Auto-execute the promise when the tickerIds change
  useEffect(() => {
    if (etfTickerSymbols.length > 0) {
      execute(etfTickerSymbols);
    } else {
      reset();
    }
  }, [etfTickerSymbols, execute, reset]);

  return { isLoading, multiETFAggregateDetails, error };
}
