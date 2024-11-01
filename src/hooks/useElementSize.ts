import { useEffect, useState } from "react";

export default function useElementSize<T extends HTMLElement>(
  elementRef: React.RefObject<T>,
) {
  const [elementSize, setElementSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

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
  }, [elementRef]);

  return elementSize;
}
