import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Layout.module.scss";

export type ContentProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const Content = forwardRef<HTMLDivElement, ContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.content, className)} {...rest}>
        {children}
      </div>
    );
  }
);

Content.displayName = "Content";

export default Content;
