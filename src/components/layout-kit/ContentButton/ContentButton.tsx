import React from "react";
import clsx from "clsx";
import Cover from "../Cover";
import styles from "./ContentButton.module.scss";

export type ContentButtonProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
  onClick?: (evt: React.SyntheticEvent) => void;
  disabled?: boolean;
};

export default function ContentButton({
  children,
  className,
  onClick,
  disabled,
  ...rest
}: ContentButtonProps) {
  return (
    <div className={clsx(styles.content_button, className)} {...rest}>
      {children}
      <Cover className={styles.cover}>
        <button
          className={styles.button}
          onClick={onClick}
          disabled={disabled}
        />
      </Cover>
    </div>
  );
}
