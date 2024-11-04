import { useEffect } from "react";

import { fetchImageInfo } from "@services/RustService";
import type { RustServiceImageInfo } from "@services/RustService";

import usePromise from "./usePromise";

export default function useEncodedImage(encSrc?: string) {
  const { data, isPending, error, execute } = usePromise<RustServiceImageInfo>({
    promiseFunction: () => fetchImageInfo(encSrc!),
    autoExecute: false,
  });

  useEffect(() => {
    if (encSrc) {
      execute();
    }
  }, [encSrc, execute]);

  return {
    isLoading: isPending,
    base64: data ? data.base64 : null,
    hasError: !!error,
  };
}
