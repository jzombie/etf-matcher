import { useEffect, useState } from "react";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@utils/callRustService";
import {
  fetchETFAggregateDetailByTickerId,
  fetchTicker10KDetail,
} from "@utils/callRustService";

import useStableCurrentRef from "./useStableCurrentRef";

// TODO: Handle error state (and rename variables; see `useTickerDetail`)
export default function useTicker10KDetail(
  tickerId: number,
  isETF: boolean,
  onLoad?: (
    detail: RustServiceTicker10KDetail | RustServiceETFAggregateDetail,
  ) => void,
) {
  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<
    RustServiceTicker10KDetail | RustServiceETFAggregateDetail | null
  >(null);

  useEffect(() => {
    if (tickerId) {
      setIsLoading(true);

      const fetchData = async () => {
        try {
          const result = isETF
            ? await fetchETFAggregateDetailByTickerId(tickerId)
            : await fetchTicker10KDetail(tickerId);

          setDetail(result);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current(result);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [tickerId, isETF, onLoadStableCurrentRef]);

  return { isLoading, detail };
}
