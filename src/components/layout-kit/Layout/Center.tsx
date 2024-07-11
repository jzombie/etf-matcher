import React from "react";
import clsx from "clsx";
import styles from "./Layout.module.scss";

export type CenterProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Center({ children, className, ...rest }: CenterProps) {
  return (
    <div className={clsx(styles.center, className)} {...rest}>
      <div className={styles["content-wrap"]}>{children}</div>
    </div>
  );
}
