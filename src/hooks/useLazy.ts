import { useEffect, useState } from "react";

export default function useLazy(value: unknown, timeoutMs: number = 50) {
  const [lazyValue, setLazyValue] = useState(value);
  useEffect(() => {
    const to = setTimeout(() => {
      setLazyValue(value);
    }, timeoutMs);

    return () => clearTimeout(to);
  }, [value, timeoutMs]);

  return lazyValue;
}
