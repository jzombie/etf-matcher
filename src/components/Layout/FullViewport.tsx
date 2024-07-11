import React from "react";
import clsx from "clsx";
import styles from "./FullViewport.module.css";

export type FullViewportProps = {
  children: React.ReactNode;
  className?: string;
};

export default function FullViewport({
  children,
  className,
  ...rest
}: FullViewportProps) {
  return (
    <div className={clsx(styles["full-viewport"], className)} {...rest}>
      {children}
    </div>
  );
}
