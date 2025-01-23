import { useEffect, useRef } from "react";

import { auditMissingTickerVectors } from "@services/RustService";
import type { RustServiceTickerSymbol } from "@services/RustService";

import arraysEqual from "@utils/arraysEqual";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import usePromise from "./usePromise";

export default function useTickerVectorAudit(
  tickerVectorConfigKey: string,
  // Note: `queryTickerSymbols` represents the `query`, not `filtered results`
  queryTickerSymbols: RustServiceTickerSymbol[],
) {
  const { triggerUIError } = useAppErrorBoundary();

  const prevTickerSymbolsRef = useRef<RustServiceTickerSymbol[]>([]);

  const {
    data: missingTickerSymbols,
    isPending: isAuditPending,
    error: auditError,
    execute: executeAudit,
  } = usePromise<
    RustServiceTickerSymbol[],
    [tickerVectorConfigKey: string, tickerSymbols: RustServiceTickerSymbol[]]
  >({
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
