import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Full.module.scss";

export type FullProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Full = forwardRef<HTMLDivElement, FullProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div className={clsx(styles.full, className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  }
);

Full.displayName = "Full";

export default Full;
