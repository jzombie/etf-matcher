import { useEffect, useRef } from "react";

import { auditMissingTickerVectors } from "@services/RustService";

import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useTickerVectorAudit(
  tickerVectorConfigKey: string,
  // Note: `queryTickerSymbols` represents the `query`, not `filtered results`
  queryTickerSymbols: string[],
) {
  const { triggerUIError } = useAppErrorBoundary();

  const prevTickerSymbolsRef = useRef<string[]>([]);

  const {
    data: missingTickerSymbols,
    isPending: isAuditPending,
    error: auditError,
    execute: executeAudit,
  } = usePromise<string[], [string, string[]]>({
    fn: (tickerVectorConfigKey, queryTickerSymbols) =>
      auditMissingTickerVectors(tickerVectorConfigKey, queryTickerSymbols),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(
        new Error("An error occurred while auditing the ticker vectors"),
      );
    },
    initialAutoExecute: false,
  });

  useEffect(() => {
    const prevTickerSymbols = prevTickerSymbolsRef.current;
    if (!arraysEqual(prevTickerSymbols, queryTickerSymbols)) {
      executeAudit(tickerVectorConfigKey, queryTickerSymbols);

      prevTickerSymbolsRef.current = queryTickerSymbols;
    }
  }, [tickerVectorConfigKey, queryTickerSymbols, executeAudit]);

  return { missingTickerSymbols, isAuditPending, auditError };
}
