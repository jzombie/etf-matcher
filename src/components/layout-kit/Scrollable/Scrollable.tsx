import React, { HTMLAttributes, useEffect, useRef } from "react";

import clsx from "clsx";

import styles from "./Scrollable.module.scss";

export type ScrollableProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  scrollX?: boolean;
  scrollY?: boolean;
  resetTrigger?: unknown;
};

const Scrollable = React.forwardRef<HTMLDivElement, ScrollableProps>(
  (
    {
      children,
      className,
      scrollX = false,
      scrollY = true,
      resetTrigger,
      ...rest
    },
    ref,
  ) => {
    const scrollableRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = 0;
        scrollableRef.current.scrollLeft = 0;
      }
    }, [resetTrigger]);

    return (
      <div
        ref={(node) => {
          scrollableRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }}
        className={clsx(
          styles.scrollable,
          {
            [styles.scroll_x]: scrollX,
            [styles.scroll_y]: scrollY,
          },
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Scrollable.displayName = "Scrollable";

export default Scrollable;
