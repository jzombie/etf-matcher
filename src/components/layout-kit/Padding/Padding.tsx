import React from "react";
import clsx from "clsx";
import Full, { FullProps } from "../Full";
import styles from "./Padding.module.scss";

export type PaddingProps = FullProps;

export default function Padding({
  children,
  className,
  ...rest
}: PaddingProps) {
  return (
    <Full className={clsx(styles.padding, className)} {...rest}>
      {children}
    </Full>
  );
}
