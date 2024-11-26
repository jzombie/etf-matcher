import { useEffect, useRef } from "react";

import { auditMissingTickerVectors } from "@services/RustService";

import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

export default function useTickerVectorAudit(
  tickerVectorConfigKey: string,
  queryTickerIds: number[],
) {
  const prevTickerIdsRef = useRef<number[]>([]);

  const {
    data: missingTickerIds,
    isPending: isAuditPending,
    error: auditError,
    execute: executeAudit,
  } = usePromise<number[], [string, number[]]>({
    fn: (tickerVectorConfigKey, queryTickerIds) =>
      auditMissingTickerVectors(tickerVectorConfigKey, queryTickerIds),
    // TODO: Also route to UI error
    onError: customLogger.error,
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
