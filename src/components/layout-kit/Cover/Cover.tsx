import React, { forwardRef, HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Cover.module.scss";
import Full from "../Full";

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  clickThrough?: boolean;
};

const Cover = forwardRef<HTMLDivElement, CoverProps>(
  ({ children, className, clickThrough = false, ...rest }, ref) => {
    return (
      <Full
        ref={ref}
        className={clsx(styles.cover, className, {
          [styles.clickThrough]: clickThrough,
        })}
        {...rest}
      >
        {children}
      </Full>
    );
  }
);

Cover.displayName = "Cover";

export default Cover;
