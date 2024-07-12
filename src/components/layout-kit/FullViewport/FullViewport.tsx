import React, { useMemo } from "react";
import clsx from "clsx";
import styles from "./FullViewport.module.scss";

export type FullViewportProps = React.HTMLAttributes<HTMLElement> & {
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
        styles.full_viewport,
        { [styles.dvh]: supportsDvhUnit },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// Test if the browser supports the 'dvh' (dynamic viewport height) unit.
//
// The 'dvh' unit adjusts for the presence of on-screen elements like the
// mobile keyboard, providing a more accurate viewport height.
// This function creates a temporary element, sets its height to '100dvh',
// and checks if the computed height is non-zero, indicating support.
// If supported, it helps in better handling of mobile keyboard layouts.
function testSupportsDvhUnit() {
  const testElement = window.document.createElement("div");
  testElement.style.height = "100dvh";
  window.document.body.appendChild(testElement);

  const supportsDvh = testElement.clientHeight !== 0;
  window.document.body.removeChild(testElement);
  return supportsDvh;
}
