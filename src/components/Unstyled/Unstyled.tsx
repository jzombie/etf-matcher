import React, { ElementType, ReactNode } from "react";

import styles from "./Unstyled.module.scss";

export type UnstyledProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export default function Unstyled<T extends ElementType = "div">({
  as,
  className = "",
  children,
  ...props
}: UnstyledProps<T>): JSX.Element {
  const Component = as || "div";

  return (
    <Component className={`${styles.unstyled} ${className}`} {...props}>
      {children}
    </Component>
  );
}
