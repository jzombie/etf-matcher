import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <header ref={ref} className={clsx(styles.header, className)} {...rest}>
        {children}
      </header>
    );
  },
);

Header.displayName = "Header";

export default Header;
