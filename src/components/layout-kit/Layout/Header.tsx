import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";
import useHasAside from "./hooks/useHasAside";

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ children, className, ...rest }, ref) => {
    const hasAside = useHasAside(children);

    return (
      <header
        ref={ref}
        className={clsx(
          styles.header,
          { [styles["header-row"]]: hasAside },
          className,
        )}
        {...rest}
      >
        {children}
      </header>
    );
  },
);

Header.displayName = "Header";

export default Header;
