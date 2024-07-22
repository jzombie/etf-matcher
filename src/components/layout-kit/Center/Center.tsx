import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Center.module.scss";

export type CenterProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.center, className)} {...rest}>
        <div className={styles.content_wrap}>{children}</div>
      </div>
    );
  }
);

Center.displayName = "Center";

export default Center;
