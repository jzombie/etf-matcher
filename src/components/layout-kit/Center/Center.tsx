import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Center.module.scss";

export type CenterProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

/**
 * The Center component vertically and horizontally centers the child
 * components.
 */
const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.center, className)} {...rest}>
        <div className={styles.content_wrap}>{children}</div>
      </div>
    );
  },
);

Center.displayName = "Center";

export default Center;
