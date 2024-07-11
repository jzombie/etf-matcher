import React from "react";
import clsx from "clsx";
import styles from "./Layout.module.scss";

export type ContentProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Content({
  children,
  className,
  ...rest
}: ContentProps) {
  return (
    <div className={clsx(styles.content, className)} {...rest}>
      {children}
    </div>
  );
}
