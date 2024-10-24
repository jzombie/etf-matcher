import { useEffect, useState } from "react";

import type { RustServiceTickerDetail } from "@services/RustService";
import { fetchTickerDetail } from "@services/RustService";

import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useStableCurrentRef from "./useStableCurrentRef";

export default function useTickerDetail(
  tickerId?: number,
  onLoad?: (tickerDetail: RustServiceTickerDetail) => void,
) {
  const onLoadStableCurrentRef = useStableCurrentRef(onLoad);

  const [isLoadingTickerDetail, setIsLoadingTickerDetail] =
    useState<boolean>(false);
  const [tickerDetail, setTickerDetail] = useState<
    RustServiceTickerDetail | undefined
  >(undefined);
  const [tickerDetailError, setTickerDetailError] = useState<Error | unknown>(
    undefined,
  );

  const { triggerUIError } = useAppErrorBoundary();

  useEffect(() => {
    if (tickerId) {
      // Unset ticker error, if exists
      setTickerDetailError(null);

      setIsLoadingTickerDetail(true);

      fetchTickerDetail(tickerId)
        .then((tickerDetail) => {
          setTickerDetail(tickerDetail);

          if (typeof onLoadStableCurrentRef.current === "function") {
            onLoadStableCurrentRef.current(tickerDetail);
          }
        })
        .catch((err) => {
          setTickerDetailError(err);
          triggerUIError(new Error("Error fetching ticker detail"));
          customLogger.error({
            tickerId,
            err,
          });
        })
        .finally(() => {
          setIsLoadingTickerDetail(false);
        });
    }
  }, [onLoadStableCurrentRef, tickerId, triggerUIError]);

  return { isLoadingTickerDetail, tickerDetail, tickerDetailError };
}
