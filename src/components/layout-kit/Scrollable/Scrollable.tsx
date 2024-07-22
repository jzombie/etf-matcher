import React, { forwardRef, HTMLAttributes, useEffect } from "react";
import clsx from "clsx";
import styles from "./Scrollable.module.scss";

export type ScrollableProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  scrollX?: boolean;
  scrollY?: boolean;
  resetTrigger?: unknown;
};

const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  (
    {
      children,
      className,
      scrollX = false,
      scrollY = true,
      resetTrigger,
      ...rest
    },
    ref
  ) => {
    const scrollableRef =
      (ref as React.MutableRefObject<HTMLDivElement>) ||
      React.createRef<HTMLDivElement>();

    useEffect(() => {
      if (resetTrigger !== undefined && scrollableRef.current) {
        scrollableRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    }, [resetTrigger, scrollableRef]);

    return (
      <div
        ref={scrollableRef}
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
