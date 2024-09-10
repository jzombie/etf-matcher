import React, { forwardRef } from "react";

import Full, { FullProps } from "@layoutKit/Full";
import clsx from "clsx";

import styles from "./Transition.module.scss";

export type TransitionChildViewProps = FullProps & {
  children: React.ReactNode;
  animationDurationCSS: string;
  transitionClassName?: string;
  className?: string;
  asNextView?: boolean;
};

const TransitionChildView = forwardRef<
  HTMLDivElement,
  TransitionChildViewProps
>(
  (
    {
      children,
      animationDurationCSS,
      transitionClassName,
      className,
      asNextView = false,
      ...rest
    },
    ref,
  ) => {
    return (
      <Full
        ref={ref}
        className={clsx(
          styles.transition_child_view,
          {
            [styles.next_view]: asNextView,
          },
          "animate__animated",
          transitionClassName,
          className,
        )}
        style={{ animationDuration: animationDurationCSS }}
        {...rest}
      >
        {
          // Note: The nested `Full` is intentional and is necessary for proper operation.
        }
        <Full>{children}</Full>
      </Full>
    );
  },
);

TransitionChildView.displayName = "TransitionChildView";

export default TransitionChildView;
