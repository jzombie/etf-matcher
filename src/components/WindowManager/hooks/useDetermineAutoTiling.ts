import { useRef, useState } from "react";

import useResizeObserver from "@hooks/useResizeObserver";

const TILING_MODE_MIN_WIDTH_THRESHOLD = 956;

export default function useDetermineAutoTiling() {
  const [isAutoTiling, setIsAutoTiling] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useResizeObserver(componentRef, () => {
    const container = componentRef.current;
    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;
    const shouldTile = containerWidth >= TILING_MODE_MIN_WIDTH_THRESHOLD;

    if (shouldTile !== isAutoTiling) {
      setIsAutoTiling(shouldTile);
    }
  });

  return { isAutoTiling, componentRef };
}
