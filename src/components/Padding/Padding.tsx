import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Padding.module.scss";

export type PaddingProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
  half?: boolean;
};

const Padding = forwardRef<HTMLElement, PaddingProps>(
  ({ children, className, half = false, ...rest }, ref) => {
    return (
      <section
        ref={ref}
        className={clsx(styles.padding, { [styles.half]: half }, className)}
        {...rest}
      >
        {children}
      </section>
    );
  },
);

Padding.displayName = "Padding";

export default Padding;
