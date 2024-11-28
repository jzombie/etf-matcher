import { useMemo } from "react";

import copySymbols from "@utils/clipboard/copySymbols";
import getIsClipboardAvailable from "@utils/clipboard/getisClipboardAvailable";
import customLogger from "@utils/customLogger";

import useAppErrorBoundary from "./useAppErrorBoundary";
import useNotification from "./useNotification";
import usePromise from "./usePromise";

export default function useClipboard() {
  const { triggerUIError } = useAppErrorBoundary();
  const { showNotification } = useNotification();

  const isClipboardAvailable = useMemo(() => getIsClipboardAvailable(), []);

  const { execute: executeCopySymbols } = usePromise<void, [string[]]>({
    fn: (symbols) => {
      if (!isClipboardAvailable) {
        const uiError = new Error("Clipboard API not available");
        triggerUIError(uiError);
        throw uiError;
      }

      const ret = copySymbols(symbols);
      showNotification(
        `${symbols.length} symbol${symbols.length !== 1 ? "s" : ""} copied to clipboard`,
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
    copySymbols: executeCopySymbols,
  };
}
