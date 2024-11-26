import { useCallback, useMemo } from "react";

import {
  RustServiceTickerVectorConfig,
  fetchAllTickerVectorConfigs,
} from "@services/RustService";

import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useStoreStateReader, { store } from "./useStoreStateReader";

export default function useTickerVectorConfigs() {
  const { triggerUIError } = useAppErrorBoundary();

  const { preferredTickerVectorConfigKey } = useStoreStateReader(
    "preferredTickerVectorConfigKey",
  );

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
    initialAutoExecute: true,
  });

  const preferredTickerVectorConfig = useMemo(() => {
    const preferredConfig = tickerVectorConfigs?.find(
      (config) => config.key === preferredTickerVectorConfigKey,
    );

    return preferredConfig;
  }, [preferredTickerVectorConfigKey, tickerVectorConfigs]);

  const setPreferredTickerVectorConfig = useCallback(
    (tickerVectorConfig: RustServiceTickerVectorConfig) => {
      store.setState({
        preferredTickerVectorConfigKey: tickerVectorConfig.key,
      });
    },
    [],
  );

  return {
    tickerVectorConfigs: tickerVectorConfigs || [],
    isLoadingTickerVectorConfigs,
    tickerVectorConfigsError,
    preferredTickerVectorConfig,
    preferredTickerVectorConfigKey: preferredTickerVectorConfig?.key,
    setPreferredTickerVectorConfig,
  };
}
