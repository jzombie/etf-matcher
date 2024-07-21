import { useMemo, useRef } from "react";

export default function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);

  return useMemo(() => {
    const previous = prevRef.current;
    prevRef.current = value;
    return previous;
  }, [value]);
}
