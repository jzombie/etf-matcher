import React from "react";
import clsx from "clsx";
import styles from "./Cover.module.scss";

import Full from "../Full";

export type CoverProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

export default function Cover({ children, className, ...rest }: CoverProps) {
  return (
    <Full className={clsx(styles.cover, className)} {...rest}>
      {children}
    </Full>
  );
}
