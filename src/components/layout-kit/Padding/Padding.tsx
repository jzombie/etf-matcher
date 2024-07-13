import React from "react";
import clsx from "clsx";
import styles from "./Padding.module.scss";

export type PaddingProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

export default function Padding({
  children,
  className,
  ...rest
}: PaddingProps) {
  return (
    <div className={clsx(styles.padding, className)} {...rest}>
      {children}
    </div>
  );
}
