import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Padding.module.scss";

export type PaddingProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Padding = forwardRef<HTMLElement, PaddingProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <section ref={ref} className={clsx(styles.padding, className)} {...rest}>
        {children}
      </section>
    );
  }
);

Padding.displayName = "Padding";

export default Padding;
