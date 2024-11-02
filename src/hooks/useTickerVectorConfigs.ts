import { useEffect, useState } from "react";

import {
  RustServiceTickerVectorConfig,
  fetchAllTickerVectorConfigs,
} from "@services/RustService";

import useAppErrorBoundary from "./useAppErrorBoundary";

// TODO: Refactor into a base `useRustServiceCall` hook (or something similarly
// named). It should include an onload callback.
export default function useTickerVectorConfigs() {
  const [tickerVectorConfigs, setTickerVectorConfigs] = useState<
    RustServiceTickerVectorConfig[]
  >([]);

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { triggerUIError } = useAppErrorBoundary();

  useEffect(() => {
    let mounted = true; // Track if the component is mounted
    setIsLoading(true);
    setError(null);

    fetchAllTickerVectorConfigs()
      .then((tickerVectorConfigs) => {
        if (mounted) {
          setTickerVectorConfigs(tickerVectorConfigs);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (mounted) {
          setError(error);
          setIsLoading(false);
          triggerUIError(error);
        }
      });

    return () => {
      mounted = false; // Cleanup function to set mounted to false
    };
  }, [triggerUIError]);

  return {
    tickerVectorConfigs,
    areTickerVectorConfigsLoading: isLoading,
    tickerVectorConfigsError: error,
  };
}
