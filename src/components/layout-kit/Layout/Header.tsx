import React from "react";
import clsx from "clsx";
import styles from "./layout.module.scss";

export type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Header({ children, className, ...rest }: HeaderProps) {
  return (
    <header className={clsx(styles["header"], className)} {...rest}>
      {children}
    </header>
  );
}
