import { useEffect, useState } from "react";

import {
  RustServiceTickerVectorConfig,
  fetchAllTickerVectorConfigs,
} from "@services/RustService";

import useAppErrorBoundary from "./useAppErrorBoundary";

export default function useTickerVectorConfigs() {
  const [tickerVectorConfigs, setTickerVectorConfigs] = useState<
    RustServiceTickerVectorConfig[]
  >([]);

  const { triggerUIError } = useAppErrorBoundary();

  useEffect(() => {
    fetchAllTickerVectorConfigs()
      .then((tickerVectorConfigs) => {
        setTickerVectorConfigs(tickerVectorConfigs);
      })
      .catch(triggerUIError);
  }, [triggerUIError]);

  return tickerVectorConfigs;
}
