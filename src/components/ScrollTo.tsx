import React, { useEffect, useRef } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type ScrollToProps = {
  scrollOptions?: ScrollIntoViewOptions;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function ScrollTo({
  scrollOptions,
  disabled,
  children,
}: ScrollToProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const scrollOptionsStableRef = useStableCurrentRef(scrollOptions);

  useEffect(() => {
    const scrollOptions = scrollOptionsStableRef.current;

    if (!disabled && elementRef.current) {
      elementRef.current.scrollIntoView(
        scrollOptions || { behavior: "smooth", block: "start" },
      );
    }
  }, [disabled, scrollOptionsStableRef]);

  return (
    <>
      <div ref={elementRef} />
      {children}
    </>
  );
}
