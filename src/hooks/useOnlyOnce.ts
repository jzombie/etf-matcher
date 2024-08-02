import { useEffect, useRef } from "react";

export default function useOnlyOnce(effect: CallableFunction) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      effect();
    }
  }, [effect]);
}
