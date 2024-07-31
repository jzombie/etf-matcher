import React, { useEffect, useRef } from "react";

import classNames from "clsx";

import Full, { FullProps } from "../Full";
import styles from "./AutoScaler.module.scss";

export type AutoScalerProps = FullProps & {
  // Determines if the scaled element should scale larger than 1x (otherwise it
  // can only be shrunk and restored to its original size
  enlargeable?: boolean;
};

/**
 * The AutoScaler component automatically applies CSS transform scaling to
 * children to prevent the children from overflowing their parent node.
 *
 * Useful for videos and canvases, where the resolution is a fixed size and
 * should not change.
 *
 * Caveats:
 *  - Rotated children may still have their edges overflow the parent
 *  - This does not work for absolutely positioned children
 */
export default function AutoScaler({
  children,
  className,
  enlargeable = false,
  ...rest
}: AutoScalerProps) {
  const outerWrapRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);

  // Handle scaling
  useEffect(() => {
    const outerWrap = outerWrapRef.current;
    const innerWrap = innerWrapRef.current;

    if (outerWrap && innerWrap) {
      let outerWrapSize = {
        width: 0,
        height: 0,
      };
      let innerWrapSize = {
        width: 0,
        height: 0,
      };

      // This is uesd w/ visibility below to try to reduce position defects
      // when first rendering
      innerWrap.style.visibility = "hidden";

      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        window.requestAnimationFrame(() => {
          for (const entry of entries) {
            const size = {
              width: (entry.target as HTMLDivElement).offsetWidth,
              height: (entry.target as HTMLDivElement).offsetHeight,
            };

            if (entry.target === outerWrap) {
              outerWrapSize = size;
            } else {
              innerWrapSize = size;
            }
          }

          // Determine against all available space
          const maxScaleX = outerWrapSize.width / innerWrapSize.width;
          const maxScaleY = outerWrapSize.height / innerWrapSize.height;

          let scale = Math.min(maxScaleX, maxScaleY);

          if (!enlargeable && scale > 1) {
            scale = 1;
          }

          innerWrap.style.transform = `scale(${scale}, ${scale})`;

          if (innerWrap.style.visibility === "hidden") {
            queueMicrotask(() => {
              innerWrap.style.visibility = "visible";
            });
          }
        });
      });

      ro.observe(outerWrap);
      ro.observe(innerWrap);

      return function unmount() {
        ro.unobserve(outerWrap);
        ro.unobserve(innerWrap);
      };
    }
  }, [enlargeable]);

  return (
    <Full
      {...rest}
      ref={outerWrapRef}
      className={classNames(styles.auto_scaler, className)}
    >
      <div ref={innerWrapRef} className={styles.content_wrap}>
        {children}
      </div>
    </Full>
  );
}
