import React from "react";
import clsx from "clsx";
import styles from "./Full.module.scss";

export type FullProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Full({ children, className, ...rest }: FullProps) {
  return (
    <footer className={clsx(styles.full, className)} {...rest}>
      {children}
    </footer>
  );
}
