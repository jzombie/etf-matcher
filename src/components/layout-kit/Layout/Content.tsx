import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Layout.module.scss";

export type ContentProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

const Content = forwardRef<HTMLElement, ContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <main ref={ref} className={clsx(styles.content, className)} {...rest}>
        {children}
      </main>
    );
  }
);

Content.displayName = "Content";

export default Content;
