import { useEffect } from "react";

import useStableCurrentRef from "./useStableCurrentRef";

export default function useResizeObserver(
  ref: React.RefObject<Element>,
  callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void,
  shouldObserve = true,
) {
  // Use a stable reference for the callback to avoid re-creation on every render
  const stableCallbackRef = useStableCurrentRef(callback);

  useEffect(() => {
    if (!shouldObserve || !ref.current) {
      return;
    }

    const handleResize = (
      entries: ResizeObserverEntry[],
      observer: ResizeObserver,
    ) => {
      stableCallbackRef.current(entries, observer);
    };

    const resizeObserver = new ResizeObserver(handleResize);

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
