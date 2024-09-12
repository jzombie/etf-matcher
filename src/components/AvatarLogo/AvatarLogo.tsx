import React from "react";

import ErrorIcon from "@mui/icons-material/Error";
import { Avatar, AvatarProps, CircularProgress } from "@mui/material";

import noImageAvailable from "@assets/no-image-available.png";
import clsx from "clsx";

import useEncodedImage from "@hooks/useEncodedImage";
import useImageBackgroundColor from "@hooks/useImageBackgroundColor";

import type {
  RustServiceTickerDetail,
  RustServiceTickerSearchResult,
} from "@utils/callRustService";

import styles from "./AvatarLogo.module.scss";

export type AvatarLogoProps = Omit<AvatarProps, "src"> & {
  tickerDetail?: RustServiceTickerDetail | RustServiceTickerSearchResult;
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

  if (isLoading) {
    return <CircularProgress style={style} className={className} />;
  }

  if (hasError) {
    return <ErrorIcon color="error" />;
  }

  if (!tickerDetail) {
    // Render a gray circle without any icon or content
    return (
      <Avatar
        {...rest}
        className={clsx(styles.avatar_logo, className)}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEBAYQ7hTQAAAAASUVORK5CYII=" // 1x1 pixel image to prevent default background
        style={{ backgroundColor: "#b0b0b0", ...style }} // Gray circle
      />
    );
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
