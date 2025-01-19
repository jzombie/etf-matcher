import { useEffect } from "react";

import type { RustServiceETFAggregateDetail } from "@services/RustService";
import { fetchETFAggregateDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export type ETFAggregateDetailRequestProps = {
  tickerSymbol?: string;
  onLoad?: (etfAggregateDetail: RustServiceETFAggregateDetail) => void;
  shouldLoad?: boolean;
};

export default function useETFAggregateDetail({
  tickerSymbol,
  onLoad,
  shouldLoad = true,
}: ETFAggregateDetailRequestProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const {
    data: etfAggregateDetail,
    isPending: isLoadingETFAggregateDetail,
    error: etfAggregateDetailError,
    execute,
  } = usePromise<RustServiceETFAggregateDetail, [string]>({
    fn: fetchETFAggregateDetail,
    onSuccess: onLoad,
    onError: (err) => {
      triggerUIError(new Error("Error fetching ETF aggregate detail"));
      customLogger.error(err);
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerSymbol && shouldLoad) {
      execute(tickerSymbol);
    }
  }, [tickerSymbol, shouldLoad, execute]);

  return {
    isLoadingETFAggregateDetail,
    etfAggregateDetail,
    etfAggregateDetailError,
  };
}
