import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

import noImageAvailable from "@assets/no-image-available.png";

import store from "@src/store";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type EncodedImageProps = React.HTMLAttributes<HTMLImageElement> & {
  encSrc?: string;
  alt?: string;
  className?: string;
};

export default function EncodedImage({
  encSrc,
  alt = "Encoded Image",
  className,
  ...rest
}: EncodedImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [base64, setBase64] = useState<string | null>(null);

  const encSrcStaticRef = useStableCurrentRef(encSrc);

  useEffect(() => {
    if (encSrcStaticRef.current !== encSrc) {
      setBase64(null);
    }

    if (encSrc) {
      setIsLoading(true);
      store
        .fetchImageBase64(encSrc)
        .then((base64) => {
          if (encSrcStaticRef.current === encSrc) {
            setBase64(base64);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [encSrc, encSrcStaticRef]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <img
      src={base64 ? `data:image/png;base64,${base64}` : noImageAvailable}
      alt={alt}
      {...rest}
    />
  );
}
