import { useMemo, useRef } from "react";

export default function usePrevious<T>(
  value: T,
  onlyUpdateOnChange = false
): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);

  const previous = useMemo(() => {
    const previous = prevRef.current;

    if (!onlyUpdateOnChange || previous !== value) {
      prevRef.current = value;
    }

    return previous;
  }, [onlyUpdateOnChange, value]);

  // return previousRef.current;
  return previous;
}
