import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import Full from "../Full";
import styles from "./Cover.module.scss";

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
  clickThrough?: boolean;
};

/**
 * The Cover component overlays a Full element on top of the parent view.
 */
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
  },
);

Cover.displayName = "Cover";

export default Cover;
