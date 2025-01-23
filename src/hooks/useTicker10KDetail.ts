import { useEffect } from "react";

import type {
  RustServiceTicker10KDetail,
  RustServiceTickerSymbol,
} from "@services/RustService";
import { fetchTicker10KDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

export default function useTicker10KDetail(
  tickerSymbol: RustServiceTickerSymbol,
) {
  const {
    data: detail,
    isPending: isLoading,
    error,
    execute,
  } = usePromise<RustServiceTicker10KDetail, [RustServiceTickerSymbol]>({
    fn: (tickerSymbol) => fetchTicker10KDetail(tickerSymbol),
    onError: customLogger.error,
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerSymbol) {
      execute(tickerSymbol);
    }
  }, [tickerSymbol, execute]);

  return { detail, isLoading, error };
}
