import { useCallback, useEffect, useRef } from "react";

// Patch for ESLint not seeing browser's IntersectionObserverCallback
type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void;

export default function useIntersectionObserver(
  callback: (visibleItems: string[]) => void,
  threshold = 0.5
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const metadataMapRef = useRef(new Map<Element, string>());
  const visibleItemsMapRef = useRef(new Map<Element, string>());

  const syncVisibleItems = useCallback(() => {
    const uniqueVisibleItems = [
      ...new Set(visibleItemsMapRef.current.values()),
    ];
    callback(uniqueVisibleItems);
  }, [callback]);

  const handleObserve = useCallback((el: HTMLElement, id: string) => {
    if (observerRef.current) {
      observerRef.current.observe(el);
      metadataMapRef.current.set(el, id);
    }
  }, []);

  const handleUnobserve = useCallback(
    (el?: HTMLElement) => {
      if (el && observerRef.current) {
        observerRef.current.unobserve(el);
        metadataMapRef.current.delete(el);
        visibleItemsMapRef.current.delete(el);

        syncVisibleItems();
      }
    },
    [syncVisibleItems]
  );

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const id = metadataMapRef.current.get(entry.target);
        if (id) {
          if (entry.isIntersecting) {
            visibleItemsMapRef.current.set(entry.target, id);
          } else {
            visibleItemsMapRef.current.delete(entry.target);
          }
        }
      });

      syncVisibleItems();
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, syncVisibleItems]);

  return {
    observe: handleObserve,
    unobserve: handleUnobserve,
  };
}
