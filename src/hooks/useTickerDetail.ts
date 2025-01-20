import { useEffect } from "react";

import type {
  RustServiceTickerDetail,
  RustServiceTickerSymbol,
} from "@services/RustService";
import { fetchTickerDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useTickerDetail(
  tickerSymbol?: RustServiceTickerSymbol,
  onLoad?: (tickerDetail: RustServiceTickerDetail) => void,
) {
  const { triggerUIError } = useAppErrorBoundary();

  const {
    data: tickerDetail,
    isPending: isLoadingTickerDetail,
    error: tickerDetailError,
    execute,
  } = usePromise<RustServiceTickerDetail, [RustServiceTickerSymbol]>({
    fn: fetchTickerDetail,
    onSuccess: onLoad,
    onError: (err) => {
      triggerUIError(new Error("Error fetching ticker detail"));
      customLogger.error({ tickerSymbol, err });
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerSymbol) {
      execute(tickerSymbol);
    }
  }, [tickerSymbol, execute]);

  return { isLoadingTickerDetail, tickerDetail, tickerDetailError };
}
