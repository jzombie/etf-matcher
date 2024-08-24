import React from "react";

import ErrorIcon from "@mui/icons-material/Error";
import { Avatar, AvatarProps, CircularProgress } from "@mui/material";

import noImageAvailable from "@assets/no-image-available.png";
import { RustServiceTickerDetail } from "@src/types";
import clsx from "clsx";

import useEncodedImage from "@hooks/useEncodedImage";
import useImageBackgroundColor from "@hooks/useImageBackgroundColor";

import styles from "./AvatarLogo.module.scss";

export type AvatarLogoProps = Omit<AvatarProps, "src"> & {
  tickerDetail?: RustServiceTickerDetail;
  title?: AvatarProps["title"];
  className?: AvatarProps["className"];
  style?: AvatarProps["style"];
};

export default function AvatarLogo({
  tickerDetail,
  title,
  className,
  style,
  ...rest
}: AvatarLogoProps) {
  const logoBgColor = useImageBackgroundColor(tickerDetail?.logo_filename);

  const { isLoading, base64, hasError } = useEncodedImage(
    tickerDetail?.logo_filename,
  );

  // Set the border color if logoBgColor exists and merge it with any existing styles
  const mergedStyle = logoBgColor
    ? { ...style, borderColor: logoBgColor, borderStyle: "solid" }
    : style;

  if (!tickerDetail) {
    return null;
  }

  if (isLoading) {
    return <CircularProgress style={style} className={className} />;
  }

  if (hasError) {
    return <ErrorIcon color="error" />;
  }

  return (
    <Avatar
      {...rest}
      title={title || `${tickerDetail.symbol} logo`}
      src={base64 ? `data:image/png;base64,${base64}` : noImageAvailable}
      className={clsx(styles.avatar_logo, className)}
      style={mergedStyle}
      slotProps={{
        img: {
          onError: (e: { currentTarget: { src: string } }) =>
            (e.currentTarget.src = noImageAvailable),
        },
      }}
    >
      {!tickerDetail.logo_filename && <ErrorIcon />}
    </Avatar>
  );
}
