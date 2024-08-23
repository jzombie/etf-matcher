import { useEffect, useState } from "react";

import store from "@src/store";
import type { RustServiceTickerDetail } from "@src/types";

import useStableCurrentRef from "./useStableCurrentRef";

export default function useTickerDetail(
  tickerId: number,
  onLoad?: (tickerDetail: RustServiceTickerDetail) => void,
) {
  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  const [isLoadingTickerDetail, setIsLoadingTickerDetail] =
    useState<boolean>(false);
  const [tickerDetail, setTickerDetail] = useState<
    RustServiceTickerDetail | undefined
  >(undefined);

  useEffect(() => {
    if (tickerId) {
      setIsLoadingTickerDetail(true);

      store
        .fetchTickerDetail(tickerId)
        .then((tickerDetail) => {
          setTickerDetail(tickerDetail);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current(tickerDetail);
          }
        })
        .finally(() => {
          setIsLoadingTickerDetail(false);
        });
    }
  }, [onLoadStableCurrentRef, tickerId]);

  return { isLoadingTickerDetail, tickerDetail };
}
