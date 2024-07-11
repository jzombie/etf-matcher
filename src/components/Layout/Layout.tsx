import React from "react";
import clsx from "clsx";
import styles from "./layout.module.scss";

export type LayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Layout({ children, className, ...rest }: LayoutProps) {
  return (
    <div className={clsx(styles["layout"], className)} {...rest}>
      {children}
    </div>
  );
}
