import React from "react";

import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";

import noImageAvailable from "@assets/no-image-available.png";

import useEncodedImage from "@hooks/useEncodedImage";

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
  const { isLoading, base64, hasError } = useEncodedImage(encSrc);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (hasError) {
    return <ErrorIcon color="error" />;
  }

  return (
    <img
      src={base64 ? `data:image/png;base64,${base64}` : noImageAvailable}
      alt={alt}
      className={className}
      {...rest}
    />
  );
}
