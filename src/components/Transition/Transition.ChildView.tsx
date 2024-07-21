import React, { forwardRef } from "react";
import Full, { FullProps } from "@layoutKit/Full";
import clsx from "clsx";

export type TransitionChildViewProps = FullProps & {
  children: React.ReactNode;
  transitionClassName?: string;
  className?: string;
};

const TransitionChildView = forwardRef<
  HTMLDivElement,
  TransitionChildViewProps
>(({ children, transitionClassName, className, ...rest }, ref) => {
  return (
    <Full
      ref={ref}
      className={clsx("animate__animated", transitionClassName, className)}
      {...rest}
    >
      <Full>{children}</Full>
    </Full>
  );
});

TransitionChildView.displayName = "TransitionChildView";

export default TransitionChildView;
