import React from "react";
import clsx from "clsx";
import styles from "./Scrollable.module.scss";

export type ScrollableProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
  scrollX?: boolean;
  scrollY?: boolean;
};

export default function Scrollable({
  children,
  className,
  scrollX = false,
  scrollY = true,
  ...rest
}: ScrollableProps) {
  return (
    <div
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
