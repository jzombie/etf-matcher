import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";

export type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={clsx(styles["layout"], className)} {...rest}>
        {children}
      </div>
    );
  },
);

Layout.displayName = "Layout";

export default Layout;
