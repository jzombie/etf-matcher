import { useEffect, useState } from "react";

export default function useLazy<T>(value: T, timeoutMs: number = 50) {
  const [lazyValue, setLazyValue] = useState<T>(value);
  useEffect(() => {
    const to = setTimeout(() => {
      setLazyValue(value);
    }, timeoutMs);

    return () => clearTimeout(to);
  }, [value, timeoutMs]);

  return lazyValue;
}
