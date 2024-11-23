import React from "react";

import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";

import noImageAvailable from "@assets/no-image-available.png";

import useEncodedImage from "@hooks/useEncodedImage";

export type EncodedImageProps = React.HTMLAttributes<HTMLImageElement> & {
  encSrc?: string;
  title?: React.HTMLAttributes<HTMLImageElement>["title"];
  className?: React.HTMLAttributes<HTMLImageElement>["className"];
  style?: React.HTMLAttributes<HTMLImageElement>["style"];
};

export default function EncodedImage({
  encSrc,
  title = "Encoded Image",
  className,
  style,
  ...rest
}: EncodedImageProps) {
  const { isLoading, base64, error } = useEncodedImage(encSrc);

  if (isLoading) {
    return <CircularProgress style={style} className={className} />;
  }

  if (error) {
    return <ErrorIcon color="error" />;
  }

  return (
    <img
      src={base64 ? `data:image/png;base64,${base64}` : noImageAvailable}
      title={title}
      className={className}
      style={style}
      {...rest}
    />
  );
}
