import { useEffect, useState } from "react";

import type { RustServiceETFAggregateDetail } from "@utils/callRustService";
import { fetchETFAggregateDetail } from "@utils/callRustService";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useStableCurrentRef from "./useStableCurrentRef";

export type ETFAggregateDetailRequestProps = {
  tickerId?: number;
  onLoad?: (etfAggregateDetail: RustServiceETFAggregateDetail) => void;
  shouldLoad?: boolean;
};

export default function useETFAggregateDetail({
  tickerId,
  onLoad,
  shouldLoad = true,
}: ETFAggregateDetailRequestProps) {
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
    if (!tickerId || !shouldLoad) {
      setETFAggregateDetailError(null);
      setIsLoadingETFAggregateDetail(false);
      return;
    }

    setETFAggregateDetailError(null);
    setIsLoadingETFAggregateDetail(true);

    fetchETFAggregateDetail(tickerId)
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
  }, [onLoadStableCurrentRef, tickerId, triggerUIError, shouldLoad]);

  return {
    isLoadingETFAggregateDetail,
    etfAggregateDetail,
    etfAggregateDetailError,
  };
}
