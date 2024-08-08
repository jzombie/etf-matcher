import { useEffect, useState } from "react";

import store from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import useStableCurrentRef from "./useStableCurrentRef";

export default function useTickerDetail(tickerId: number, onLoad?: () => void) {
  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  const [isLoadingTickerDetail, setIsLoadingTickerDetail] =
    useState<boolean>(false);
  const [tickerDetail, setTickerDetail] =
    useState<RustServiceTickerDetail | null>(null);

  useEffect(() => {
    if (tickerId) {
      setIsLoadingTickerDetail(true);

      store
        .fetchTickerDetail(tickerId)
        .then(setTickerDetail)
        .finally(() => {
          setIsLoadingTickerDetail(false);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current();
          }
        });
    }
  }, [onLoadStableCurrentRef, tickerId]);

  return { isLoadingTickerDetail, tickerDetail };
}
