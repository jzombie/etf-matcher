import React, { HTMLAttributes, forwardRef } from "react";

import clsx from "clsx";

import styles from "./FullViewport.module.scss";

export type FullViewportProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

const supportsDvhUnit = testSupportsDvhUnit();

const FullViewport = forwardRef<HTMLDivElement, FullViewportProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div className={styles.full_viewport}>
        <div
          ref={ref}
          className={clsx(
            styles.content_wrap,
            { [styles.dvh]: supportsDvhUnit },
            className,
          )}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

FullViewport.displayName = "FullViewport";

export default FullViewport;

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
