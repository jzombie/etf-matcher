import { useEffect } from "react";

import type { RustServiceTickerDetail } from "@services/RustService";
import { fetchTickerDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useTickerDetail(
  tickerId?: number,
  onLoad?: (tickerDetail: RustServiceTickerDetail) => void,
) {
  const { triggerUIError } = useAppErrorBoundary();

  const {
    data: tickerDetail,
    isPending: isLoadingTickerDetail,
    error: tickerDetailError,
    execute,
  } = usePromise<RustServiceTickerDetail, [number]>({
    fn: fetchTickerDetail,
    onLoad,
    onError: (err) => {
      triggerUIError(new Error("Error fetching ticker detail"));
      customLogger.error({ tickerId, err });
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerId) {
      execute(tickerId);
    }
  }, [tickerId, execute]);

  return { isLoadingTickerDetail, tickerDetail, tickerDetailError };
}
