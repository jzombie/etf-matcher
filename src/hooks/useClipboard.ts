import { useMemo } from "react";

import type { RustServiceTickerSymbol } from "@services/RustService";

import copyTickerSymbols from "@utils/clipboard/copyTickerSymbols";
import getIsClipboardAvailable from "@utils/clipboard/getIsClipboardAvailable";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useNotification from "./useNotification";
import usePromise from "./usePromise";

export default function useClipboard() {
  const { triggerUIError } = useAppErrorBoundary();
  const { showNotification } = useNotification();

  const isClipboardAvailable = useMemo(() => getIsClipboardAvailable(), []);

  const { execute: executeCopyTickerSymbols } = usePromise<
    void,
    [RustServiceTickerSymbol[]]
  >({
    fn: async (tickerSymbols) => {
      const ret = await copyTickerSymbols(tickerSymbols);

      showNotification(
        `${tickerSymbols.length} symbol${tickerSymbols.length !== 1 ? "s" : ""} copied to clipboard`,
        "success",
      );

      return ret;
    },
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not copy symbols"));
    },
    initialAutoExecute: false,
  });

  return {
    isClipboardAvailable,
    copyTickerSymbols: executeCopyTickerSymbols,
  };
}
