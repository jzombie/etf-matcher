import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Scrollable.module.scss";

export type ScrollableProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  scrollX?: boolean;
  scrollY?: boolean;
};

const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  ({ children, className, scrollX = false, scrollY = true, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.scrollable,
          {
            [styles.scroll_x]: scrollX,
            [styles.scroll_y]: scrollY,
          },
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Scrollable.displayName = "Scrollable";

export default Scrollable;
