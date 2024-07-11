import React from "react";
import clsx from "clsx";
import styles from "./Footer.module.css";

export type FooterProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Footer({ children, className, ...rest }: FooterProps) {
  return (
    <footer className={clsx(styles["footer"], className)} {...rest}>
      {children}
    </footer>
  );
}
