import React from "react";

import { Box } from "@mui/material";

import Full from "@layoutKit/Full";
import { Mosaic, MosaicNode } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import ExampleWindow, { ExampleWindowProps } from "./ExampleWindow";

export type WindowManagerProps = {
  initialValue: MosaicNode<string>;
  contentMap: { [key: string]: React.ReactNode }; // Pass content for windows
};

export default function WindowManager({
  initialValue,
  contentMap,
}: WindowManagerProps) {
  return (
    <Full style={{ backgroundColor: "gray" }}>
      <Box sx={{ backgroundColor: "black", width: "100%", height: 500 }}>
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
