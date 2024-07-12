import React from "react";
import clsx from "clsx";
import styles from "./Cover.module.scss";

import Full from "../Full";

export type CoverProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
  clickThrough?: boolean;
};

export default function Cover({
  children,
  className,
  clickThrough = false,
  ...rest
}: CoverProps) {
  return (
    <Full
      className={clsx(styles.cover, className, {
        [styles.clickThrough]: clickThrough,
      })}
      {...rest}
    >
      {children}
    </Full>
  );
}
