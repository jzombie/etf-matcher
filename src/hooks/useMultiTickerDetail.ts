import { useEffect } from "react";

import type { RustServiceTickerDetail } from "@services/RustService";
import { fetchTickerDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useMultiTickerDetail(
  tickerIds: number[] = [],
  onLoad?: (tickerDetails: RustServiceTickerDetail[]) => void,
) {
  const { triggerUIError } = useAppErrorBoundary();

  const fetchDetails = async (
    ids: number[],
  ): Promise<RustServiceTickerDetail[]> => {
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetchTickerDetail(id).catch((err) => {
          customLogger.error({ tickerId: id, err });
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
  } = usePromise<RustServiceTickerDetail[], [number[]]>({
    fn: fetchDetails,
    onLoad,
    onError: triggerUIError,
    autoExecute: false,
  });

  // Auto-execute the promise when the tickerIds change
  useEffect(() => {
    if (tickerIds.length > 0) {
      execute(tickerIds);
    } else {
      reset();
    }
  }, [tickerIds, execute, reset]);

  return { isLoading, multiTickerDetails, error };
}
