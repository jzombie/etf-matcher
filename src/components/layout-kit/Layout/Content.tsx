import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Layout.module.scss";
import useHasAside from "./hooks/useHasAside";

// Import the Aside component for type checking

export type ContentProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Content = forwardRef<HTMLElement, ContentProps>(
  ({ children, className, ...rest }, ref) => {
    const hasAside = useHasAside(children);

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
