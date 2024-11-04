import {
  RustServiceTickerVectorConfig,
  fetchAllTickerVectorConfigs,
} from "@services/RustService";

import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";

export default function useTickerVectorConfigs() {
  const { triggerUIError } = useAppErrorBoundary();

  const {
    data: tickerVectorConfigs,
    isPending: isLoadingTickerVectorConfigs,
    error: tickerVectorConfigsError,
  } = usePromise<RustServiceTickerVectorConfig[]>({
    fn: fetchAllTickerVectorConfigs,
    onError: (error) => {
      customLogger.error(error);

      triggerUIError(
        new Error("Error when trying to load ticker vector configs"),
      );
    },
    autoExecute: true,
  });

  return {
    tickerVectorConfigs: tickerVectorConfigs || [],
    isLoadingTickerVectorConfigs,
    tickerVectorConfigsError,
  };
}
