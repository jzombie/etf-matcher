import { useEffect, useState } from "react";

export default function useElementSize<T extends HTMLElement>(
  element?: T | null,
) {
  const [elementSize, setElementSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element) {
      setElementSize({ width: 0, height: 0 });
      return;
    }

    const updateSize = () => {
      setElementSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    };

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(element);

    // Initial size update
    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [element]);

  return elementSize;
}
