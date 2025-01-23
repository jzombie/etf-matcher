import { useEffect, useRef } from "react";

import type {
  RustServiceTickerDetail,
  RustServiceTickerSymbol,
} from "@services/RustService";
import { fetchTickerDetail } from "@services/RustService";

import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useMultiTickerDetail(
  tickerSymbols: RustServiceTickerSymbol[] = [],
  onLoad?: (tickerDetails: RustServiceTickerDetail[]) => void,
) {
  const { triggerUIError } = useAppErrorBoundary();
  const previousTickerSymbolsRef = useRef<RustServiceTickerSymbol[]>([]);

  const fetchDetails = async (
    tickerSymbols: RustServiceTickerSymbol[],
  ): Promise<RustServiceTickerDetail[]> => {
    const results = await Promise.allSettled(
      tickerSymbols.map((tickerSymbol) =>
        fetchTickerDetail(tickerSymbol).catch((err) => {
          customLogger.error({ tickerSymbol, err });
          return { status: "rejected", reason: err };
        }),
      ),
    );

    const fulfilledResults = results
      .filter(
        (result): result is PromiseFulfilledResult<RustServiceTickerDetail> =>
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
        throw new Error(`Error fetching ticker detail: ${result.reason}`);
      });

    if (rejectedResults.length > 0) {
      throw new Error("Some ticker details could not be fetched.");
    }

    return fulfilledResults;
  };

  const {
    data: multiTickerDetails,
    isPending: isLoading,
    error,
    execute,
    reset,
  } = usePromise<RustServiceTickerDetail[], [RustServiceTickerSymbol[]]>({
    fn: fetchDetails,
    onSuccess: onLoad,
    onError: triggerUIError,
    initialAutoExecute: false,
  });

  // Auto-execute the promise when the tickerSymbols change
  useEffect(() => {
    // Prevent unnecessary auto-execution if ticker values remain unchanged.
    //
    // This resolves an issue where a stable reference change for `tickerSymbols`
    // would trigger execution, even if their underlying values were identical.
    // By skipping redundant executions, this avoids excessive reloading
    // in `TickerBucketViewWindowManager`.
    if (arraysEqual(previousTickerSymbolsRef.current, tickerSymbols)) {
      return;
    }

    if (tickerSymbols.length > 0) {
      execute(tickerSymbols);
    } else {
      reset();
    }

    previousTickerSymbolsRef.current = tickerSymbols;
  }, [tickerSymbols, execute, reset]);

  return { isLoading, multiTickerDetails, error };
}
