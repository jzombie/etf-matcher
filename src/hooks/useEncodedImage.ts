import { useEffect } from "react";

import { fetchImageInfo } from "@services/RustService";
import type { RustServiceImageInfo } from "@services/RustService";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

export default function useEncodedImage(encSrc?: string) {
  const { data, isPending, error, execute } = usePromise<
    RustServiceImageInfo,
    [string]
  >({
    fn: (encSrc) => fetchImageInfo(encSrc),
    initialAutoExecute: false,
    onError: customLogger.error,
  });

  useEffect(() => {
    if (encSrc) {
      execute(encSrc);
    }
  }, [encSrc, execute]);

  return {
    isLoading: isPending,
    base64: data ? data.base64 : null,
    error,
  };
}
