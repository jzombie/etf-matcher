import { useEffect, useState } from "react";

import store from "@src/store";

import type { RustServiceImageInfo } from "@utils/callRustService";

import useStableCurrentRef from "./useStableCurrentRef";

export default function useEncodedImage(encSrc?: string) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [base64, setBase64] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  const encSrcStaticRef = useStableCurrentRef(encSrc);

  useEffect(() => {
    if (encSrcStaticRef.current !== encSrc) {
      setBase64(null);
      setHasError(false); // Reset error state on new image source
    }

    if (encSrc) {
      setIsLoading(true);
      store
        .fetchImageInfo(encSrc)
        .then((imageInfo: RustServiceImageInfo) => {
          if (encSrcStaticRef.current === encSrc) {
            setBase64(imageInfo.base64);
            setHasError(false); // Reset error state if the image loads successfully
          }
        })
        .catch(() => {
          setHasError(true); // Set error state if the image fails to load
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [encSrc, encSrcStaticRef]);

  return { isLoading, base64, hasError };
}
