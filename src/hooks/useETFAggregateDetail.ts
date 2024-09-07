import { useEffect, useState } from "react";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import { fetchETFAggregateDetailByTickerId } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useStableCurrentRef from "./useStableCurrentRef";

export default function useETFAggregateDetail(
  tickerId?: number,
  onLoad?: (etfAggregateDetail: RustServiceETFAggregateDetail) => void,
) {
  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  const [isLoadingETFAggregateDetail, setIsLoadingETFAggregateDetail] =
    useState<boolean>(false);
  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);
  const [etfAggregateDetailError, setETFAggregateDetailError] = useState<
    Error | unknown
  >(undefined);

  const { triggerUIError } = useAppErrorBoundary();

  useEffect(() => {
    if (tickerId) {
      setETFAggregateDetailError(null);
      setIsLoadingETFAggregateDetail(true);

      fetchETFAggregateDetailByTickerId(tickerId)
        .then((tickerDetail) => {
          setETFAggregateDetail(tickerDetail);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current(tickerDetail);
          }
        })
        .catch((err) => {
          setETFAggregateDetailError(err);
          triggerUIError(new Error("Error fetching ETF aggregate detail"));
          customLogger.error(err);
        })
        .finally(() => {
          setIsLoadingETFAggregateDetail(false);
        });
    }
  }, [onLoadStableCurrentRef, tickerId, triggerUIError]);

  return {
    isLoadingETFAggregateDetail,
    etfAggregateDetail,
    etfAggregateDetailError,
  };
}
