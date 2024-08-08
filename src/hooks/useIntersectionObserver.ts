import { useCallback, useEffect, useRef } from "react";

import useStableCurrentRef from "./useStableCurrentRef";

// Patch for ESLint not seeing browser's IntersectionObserverCallback
type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

export default function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  threshold = 0.5,
  shouldObserve = true,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const callbackStableRef = useStableCurrentRef(callback);

  useEffect(() => {
    if (!shouldObserve) {
      return;
    }

    if (!observerRef.current) {
      const callback = callbackStableRef.current;

      observerRef.current = new IntersectionObserver(callback, { threshold });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [shouldObserve, callbackStableRef, threshold]);

  const observe = useCallback((el: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.observe(el);
    }
  }, []);

  const unobserve = useCallback((el: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(el);
    }
  }, []);

  return {
    observe,
    unobserve,
  };
}
