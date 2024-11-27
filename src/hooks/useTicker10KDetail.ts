import { useEffect } from "react";

import type { RustServiceTicker10KDetail } from "@services/RustService";
import { fetchTicker10KDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

export default function useTicker10KDetail(tickerId: number) {
  const {
    data: detail,
    isPending: isLoading,
    error,
    execute,
  } = usePromise<RustServiceTicker10KDetail, [is: number]>({
    fn: (id) => fetchTicker10KDetail(id),
    onError: customLogger.error,
    initialAutoExecute: false,
  });

  useEffect(() => {
    if (tickerId) {
      execute(tickerId);
    }
  }, [tickerId, execute]);

  return { detail, isLoading, error };
}
