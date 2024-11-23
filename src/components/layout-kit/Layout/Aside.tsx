import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";

export type AsideProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Aside = forwardRef<HTMLElement, AsideProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <aside ref={ref} className={clsx(styles.aside, className)} {...rest}>
        {children}
      </aside>
    );
  },
);

Aside.displayName = "Aside";

export default Aside;
