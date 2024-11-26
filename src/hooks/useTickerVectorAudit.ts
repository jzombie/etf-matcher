import { useEffect, useRef } from "react";

import { auditMissingTickerVectors } from "@services/RustService";

import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useTickerVectorAudit(
  tickerVectorConfigKey: string,
  queryTickerIds: number[],
) {
  const { triggerUIError } = useAppErrorBoundary();

  const prevTickerIdsRef = useRef<number[]>([]);

  const {
    data: missingTickerIds,
    isPending: isAuditPending,
    error: auditError,
    execute: executeAudit,
  } = usePromise<number[], [string, number[]]>({
    fn: (tickerVectorConfigKey, queryTickerIds) =>
      auditMissingTickerVectors(tickerVectorConfigKey, queryTickerIds),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(
        new Error("An error occurred while auditing the ticker vectors"),
      );
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    const prevTickerIds = prevTickerIdsRef.current;
    if (!arraysEqual(prevTickerIds, queryTickerIds)) {
      executeAudit(tickerVectorConfigKey, queryTickerIds);

      prevTickerIdsRef.current = queryTickerIds;
    }
  }, [tickerVectorConfigKey, queryTickerIds, executeAudit]);

  return { missingTickerIds, isAuditPending, auditError };
}
