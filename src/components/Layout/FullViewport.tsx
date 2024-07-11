import React, { useMemo } from "react";
import clsx from "clsx";
import styles from "./layout.module.scss";

export type FullViewportProps = {
  children: React.ReactNode;
  className?: string;
};

export default function FullViewport({
  children,
  className,
  ...rest
}: FullViewportProps) {
  const supportsDvhUnit = useMemo(testSupportsDvhUnit, []);

  return (
    <div
      className={clsx(
        styles["full-viewport"],
        { [styles.dvh]: supportsDvhUnit },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function testSupportsDvhUnit() {
  const testElement = window.document.createElement("div");
  testElement.style.height = "100dvh";
  window.document.body.appendChild(testElement);

  const supportsDvh = testElement.clientHeight !== 0;
  window.document.body.removeChild(testElement);
  return supportsDvh;
}
