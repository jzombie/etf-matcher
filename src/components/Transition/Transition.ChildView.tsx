import React, { useEffect, forwardRef } from "react";
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
      // className={`animate__animated ${transitionClass}`}
      className={clsx("animate__animated", transitionClassName, className)}
      {...rest}
    >
      <Full>{children}</Full>
    </Full>
  );
});

export default TransitionChildView;
