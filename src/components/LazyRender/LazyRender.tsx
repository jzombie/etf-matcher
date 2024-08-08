import React, { ReactNode, useEffect, useRef, useState } from "react";

import useIntersectionObserver from "@hooks/useIntersectionObserver";

export interface LazyRenderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  threshold?: number;
}

export default function LazyRender({
  children,
  threshold = 0.1,
  ...rest
}: LazyRenderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const intersectionCallback: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        unobserve(entry.target as HTMLElement);
      }
    });
  };

  const { observe, unobserve } = useIntersectionObserver(
    intersectionCallback,
    threshold,
  );

  useEffect(() => {
    const el = ref.current;

    if (el) {
      observe(el);

      return () => {
        unobserve(el);
      };
    }
  }, [observe, unobserve]);

  return (
    <div ref={ref} {...rest}>
      {isVisible ? children : null}
    </div>
  );
}
