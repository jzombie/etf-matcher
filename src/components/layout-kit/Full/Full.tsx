import React, { ElementType, forwardRef } from "react";

import clsx from "clsx";

import styles from "./Full.module.scss";

// Define FullProps with a generic for the component type
export type FullProps<T extends ElementType = "div"> = {
  /**
   * The element type to render, e.g., "div", "section", or a custom React component.
   */
  component?: T;
  /**
   * Optional className for styling.
   */
  className?: string;
  /**
   * Children to render inside the component.
   */
  children?: React.ReactNode;
} & React.ComponentPropsWithRef<T>;

const Full = forwardRef(
  <T extends ElementType = "div">(
    {
      component: Component = "div",
      className,
      children,
      ...rest
    }: FullProps<T>,
    ref: React.Ref<Element>,
  ) => {
    return (
      <Component className={clsx(styles.full, className)} ref={ref} {...rest}>
        {children}
      </Component>
    );
  },
);

Full.displayName = "Full";

export default Full;
