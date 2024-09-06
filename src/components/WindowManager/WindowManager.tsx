import React, { useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";

import Full from "@layoutKit/Full";
import { Mosaic, MosaicNode } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import ExampleWindow from "./ExampleWindow";

export type WindowManagerProps = {
  initialValue: MosaicNode<string>;
  contentMap: { [key: string]: React.ReactNode };
};

// Main window manager component
export default function WindowManager({
  initialValue,
  contentMap,
}: WindowManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver to update dimensions when the container is resized
  useEffect(() => {
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { contentRect } = entries[0];
      setDimensions({
        width: contentRect.width,
        height: contentRect.height,
      });
    });

    if (container) {
      resizeObserver.observe(container);
    }

    // Cleanup the observer on unmount
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  return (
    <Full ref={containerRef}>
      <Box
        sx={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <Mosaic<string>
          renderTile={(id, path) => (
            <ExampleWindow
              id={id}
              path={path}
              totalWindowCount={3}
              content={contentMap[id]}
            />
          )}
          initialValue={initialValue}
        />
      </Box>
    </Full>
  );
}
