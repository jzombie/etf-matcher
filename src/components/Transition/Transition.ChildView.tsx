import React, { useEffect, forwardRef } from "react";
import Full, { FullProps } from "@layoutKit/Full";

export type TransitionChildViewProps = FullProps & {
  children: React.ReactNode;
  transitionClass: string;
};

const TransitionChildView = forwardRef<
  HTMLDivElement,
  TransitionChildViewProps
>(({ children, transitionClass, ...rest }, ref) => {
  return (
    <Full
      ref={ref}
      className={`animate__animated ${transitionClass}`}
      {...rest}
    >
      <Full>{children}</Full>
    </Full>
  );
});

export default TransitionChildView;
