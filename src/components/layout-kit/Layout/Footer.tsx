import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";
import useHasAside from "./hooks/useHasAside";

export type FooterProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Footer = forwardRef<HTMLElement, FooterProps>(
  ({ children, className, ...rest }, ref) => {
    const hasAside = useHasAside(children);

    return (
      <footer
        ref={ref}
        className={clsx(
          styles.footer,
          { [styles["footer-row"]]: hasAside },
          className,
        )}
        {...rest}
      >
        {children}
      </footer>
    );
  },
);

Footer.displayName = "Footer";

export default Footer;
