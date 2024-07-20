import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/Error";

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
        .fetchImageBase64(encSrc)
        .then((base64) => {
          if (encSrcStaticRef.current === encSrc) {
            setBase64(base64);
            setHasError(false); // Reset error state if the image loads successfully
          }
        })
        .catch((err) => {
          console.error(err);
          setHasError(true); // Set error state if the image fails to load
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [encSrc, encSrcStaticRef]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (hasError) {
    return <ErrorIcon color="error" />; // Show error icon if there was an error
  }

  return (
    <img
      src={base64 ? `data:image/png;base64,${base64}` : noImageAvailable}
      alt={alt}
      {...rest}
    />
  );
}
