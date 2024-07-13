import { useCallback, useEffect, useRef } from "react";

// Patch for ESLint not seeing browser's IntersectionObserverCallback
type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void;

export default function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  threshold = 0.5
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      threshold,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, threshold]);

  const observe = useCallback((el: HTMLElement) => {
    observerRef.current?.observe(el);
  }, []);

  const unobserve = useCallback((el: HTMLElement) => {
    observerRef.current?.unobserve(el);
  }, []);

  return {
    observe,
    unobserve,
  };
}
