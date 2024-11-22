import React, { Children, HTMLAttributes, forwardRef, useMemo } from "react";

import clsx from "clsx";

import Aside from "./Aside";
import styles from "./Layout.module.scss";

// Import the Aside component for type checking

export type ContentProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Content = forwardRef<HTMLElement, ContentProps>(
  ({ children, className, ...rest }, ref) => {
    // TODO: Extract to a hook
    // Check if an "Aside" component is a direct child
    const hasAside = useMemo(
      () =>
        Children.toArray(children).some(
          (child) => React.isValidElement(child) && child.type === Aside,
        ),
      [children],
    );

    return (
      <main
        ref={ref}
        className={clsx(
          styles.content,
          { [styles["content-row"]]: hasAside },
          className,
        )}
        {...rest}
      >
        {children}
      </main>
    );
  },
);

Content.displayName = "Content";

export default Content;
