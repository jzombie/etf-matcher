import React from "react";

import { Box } from "@mui/material";

import Full from "@layoutKit/Full";
import { Mosaic, MosaicNode } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import ExampleWindow from "./ExampleWindow";

export type WindowManagerProps = {
  initialValue: MosaicNode<string>;
};

// Main window manager component
export default function WindowManager({ initialValue }: WindowManagerProps) {
  return (
    <Full style={{ backgroundColor: "gray" }}>
      <Box sx={{ backgroundColor: "black", width: "100%", height: 500 }}>
        <Mosaic<string>
          renderTile={(id, path) => (
            <ExampleWindow id={id} path={path} totalWindowCount={3} />
          )}
          initialValue={initialValue}
          // initialValue={{
          //   direction: "column",
          //   first: "Detail",
          //   second: {
          //     direction: "row",
          //     first: "Historical Prices",
          //     second: "Similarity Search",
          //   },
          //   splitPercentage: 40,
          // }}
        />
      </Box>
    </Full>
  );
}
