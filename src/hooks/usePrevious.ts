import { useEffect, useRef } from "react";

export default function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    // Update the ref to the current value on every render
    ref.current = value;
  }, [value]);

  // Return the previous value (happens before the current value is set in the effect above)
  return ref.current;
}
