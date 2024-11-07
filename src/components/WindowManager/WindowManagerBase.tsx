import React, { useCallback, useRef, useState } from "react";

import { Box } from "@mui/material";

import Full from "@layoutKit/Full";
import { Mosaic, MosaicNode } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import useResizeObserver from "@hooks/useResizeObserver";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

import Window from "./WindowManagerBase.Window";
import "./mosaic-custom-overrides.css";

const DEBOUNCED_RESIZE_TIMEOUT = 100;

export type WindowManagerBaseProps = {
  initialLayout: MosaicNode<string>;
  contentMap: { [key: string]: React.ReactNode };
  layout?: MosaicNode<string>;
  onLayoutChange?: (newLayout: MosaicNode<string> | null) => void;
};

export default function WindowManagerBase({
  initialLayout,
  contentMap,
  layout,
  onLayoutChange,
}: WindowManagerBaseProps) {
  const onChangeStableCurrentRef = useStableCurrentRef(onLayoutChange);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingStableCurrentRef = useStableCurrentRef(isResizing);

  const handleLayoutChange = useCallback(
    (newLayout: MosaicNode<string> | null) => {
      const onChange = onChangeStableCurrentRef.current;

      if (!isResizingStableCurrentRef.current) {
        // Set resizing to true
        setIsResizing(true);
      }

      // Call the provided onChange if it exists
      if (typeof onChange === "function") {
        onChange(newLayout);
      }

      // Clear any previous timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Set a new timeout to set `isResizing` to false after 100ms
      resizeTimeoutRef.current = setTimeout(() => {
        setIsResizing(false);
      }, DEBOUNCED_RESIZE_TIMEOUT);
    },
    [onChangeStableCurrentRef, isResizingStableCurrentRef],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useResizeObserver(containerRef, (entries) => {
    if (!entries || entries.length === 0) return;
    const { contentRect } = entries[0];
    setDimensions({
      width: contentRect.width,
      height: contentRect.height,
    });
  });

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
            <Window
              id={id}
              path={path}
              totalWindowCount={3}
              content={contentMap[id]}
              isResizing={isResizing}
            />
          )}
          initialValue={initialLayout}
          value={layout}
          zeroStateView={<CustomZeroStateView />}
          onChange={handleLayoutChange}
        />
      </Box>
    </Full>
  );
}

function CustomZeroStateView() {
  return (
    <div style={{ textAlign: "center", padding: "20px", color: "#fff" }}>
      <h2>No windows open</h2>
      <p>Use the controls to open new windows.</p>
    </div>
  );
}
