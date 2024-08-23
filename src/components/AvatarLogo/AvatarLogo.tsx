import React from "react";

import { RustServiceTickerDetail } from "@src/types";
import clsx from "clsx";

import useImageBackgroundColor from "@hooks/useImageBackgroundColor";

import EncodedImage, { EncodedImageProps } from "../EncodedImage";
import styles from "./AvatarLogo.module.scss";

export type AvatarLogoProps = Omit<EncodedImageProps, "encSrc"> & {
  tickerDetail?: RustServiceTickerDetail;
};

// TODO: Refactor to use MUI's `Avatar` component?
export default function AvatarLogo({
  tickerDetail,
  className,
  style,
  ...rest
}: AvatarLogoProps) {
  const logoBgColor = useImageBackgroundColor(tickerDetail?.logo_filename);

  if (!tickerDetail) {
    return null;
  }

  // Set the border color if logoBgColor exists and merge it with any existing styles
  const mergedStyle = logoBgColor
    ? { ...style, borderColor: logoBgColor, borderStyle: "solid" }
    : style;

  return (
    <EncodedImage
      encSrc={tickerDetail?.logo_filename}
      className={clsx(styles.avatar_logo, className)}
      style={mergedStyle}
      {...rest}
    />
  );
}
