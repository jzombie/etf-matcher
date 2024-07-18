import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import clsx from "clsx";
import styles from "./EncodedImage.module.scss";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    }
  }, [encSrc, encSrcStaticRef]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return base64 ? (
    <img src={`data:image/png;base64,${base64}`} alt={alt} {...rest} />
  ) : (
    <div className={clsx(styles.no_image_fallback, className)} {...rest}>
      N/A
    </div>
  );
}
