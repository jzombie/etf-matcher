import { useEffect } from "react";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@services/RustService";
import {
  fetchETFAggregateDetail,
  fetchTicker10KDetail,
} from "@services/RustService";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

// TODO: Rename `detail` to `ticker10KDetail` (or equivalent)
export default function useTicker10KDetail(tickerId: number, isETF: boolean) {
  const {
    data: detail,
    isPending: isLoading,
    error,
    execute,
  } = usePromise<
    RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
    [is: number, isETF: boolean]
  >({
    promiseFunction: (id, isETF) =>
      isETF ? fetchETFAggregateDetail(id) : fetchTicker10KDetail(id),
    onError: customLogger.error,
    autoExecute: false,
  });

  useEffect(() => {
    if (tickerId) {
      execute(tickerId, isETF);
    }
  }, [tickerId, isETF, execute]);

  return { detail, isLoading, error };
}
