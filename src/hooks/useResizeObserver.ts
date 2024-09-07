import { useEffect } from "react";

import useStableCurrentRef from "./useStableCurrentRef";

export function useResizeObserver(
  ref: React.RefObject<Element>,
  callback: () => void,
  shouldObserve = true, // Add the shouldObserve flag
) {
  // Use a stable reference for the callback to avoid re-creation on every render
  const stableCallbackRef = useStableCurrentRef(callback);

  useEffect(() => {
    if (!shouldObserve || !ref.current) {
      return;
    }

    const handleResize = () => {
      if (ref.current) {
        stableCallbackRef.current();
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());

    const container = ref.current;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [ref, stableCallbackRef, shouldObserve]);
}
