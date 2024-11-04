import { useEffect, useState } from "react";

import type {
  RustServiceETFAggregateDetail,
  RustServiceTicker10KDetail,
} from "@services/RustService";
import {
  fetchETFAggregateDetail,
  fetchTicker10KDetail,
} from "@services/RustService";

// TODO: Refactor to use `usePromise`
//
// TODO: Handle error state (and rename variables; see `useTickerDetail`)
export default function useTicker10KDetail(tickerId: number, isETF: boolean) {
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
            ? await fetchETFAggregateDetail(tickerId)
            : await fetchTicker10KDetail(tickerId);

          setDetail(result);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [tickerId, isETF]);

  // TODO: Rename to `financialDetail` or `tenKDetail`
  return { isLoading, detail };
}
