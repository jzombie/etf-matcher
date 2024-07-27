import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";

export type FooterProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Footer = forwardRef<HTMLDivElement, FooterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <footer ref={ref} className={clsx(styles.footer, className)} {...rest}>
        {children}
      </footer>
    );
  },
);

Footer.displayName = "Footer";

export default Footer;
