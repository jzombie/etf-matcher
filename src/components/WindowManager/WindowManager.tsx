import React, { useEffect } from "react";

import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Layout, { Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import customLogger from "@utils/customLogger";

import WindowManagerBase from "./WindowManagerBase";
import useDetermineAutoTiling from "./hooks/useDetermineAutoTiling";
import useWindowManagerLayout from "./hooks/useWindowManagerLayout";

export type WindowManagerProps = {
  initialLayout: MosaicNode<string>;
  contentMap: Record<string, React.ReactNode>;
  onTilingStateChange?: (isTiling: boolean) => void;
};

export default function WindowManager({
  initialLayout,
  contentMap,
  onTilingStateChange,
}: WindowManagerProps) {
  const { isAutoTiling: isTiling, componentRef: layoutRef } =
    useDetermineAutoTiling();

  const onTilingStateChangeRef = useStableCurrentRef(onTilingStateChange);

  useEffect(() => {
    const onTilingStateChange = onTilingStateChangeRef.current;

    if (typeof onTilingStateChange === "function") {
      onTilingStateChange(isTiling);
    }
  }, [isTiling, onTilingStateChangeRef]);

  const {
    layout,
    setLayout,
    toggleWindow,
    areAllWindowsOpen,
    openedWindows,
    updateOpenWindows,
  } = useWindowManagerLayout({
    initialLayout,
    contentMap,
  });

  return (
    <Layout ref={layoutRef}>
      <Content>
        {isTiling ? (
          <Layout>
            <Content>
              <WindowManagerBase
                initialLayout={layout || initialLayout}
                contentMap={contentMap}
                onLayoutChange={(newLayout) => {
                  setLayout(newLayout);
                  updateOpenWindows(newLayout); // Update open windows when layout changes

                  // TODO: Remove
                  customLogger.debug({ newLayout });
                }}
              />
            </Content>
            {!areAllWindowsOpen && (
              <Footer>
                <Box sx={{ overflow: "auto" }}>
                  {/* Dynamically generate buttons based on contentMap */}
                  <ToggleButtonGroup
                    value={Array.from(openedWindows)} // Convert openWindows to array
                    aria-label="window selection"
                    sx={{ float: "right" }}
                  >
                    {Object.keys(contentMap).map((key) => {
                      if (openedWindows.has(key)) {
                        return null;
                      }

                      return (
                        <ToggleButton
                          key={key}
                          value={key}
                          disabled={openedWindows.has(key)} // Disable button if the window is open
                          onClick={() => toggleWindow(key)} // Toggle window on click
                        >
                          {key}
                        </ToggleButton>
                      );
                    })}
                  </ToggleButtonGroup>
                </Box>
              </Footer>
            )}
          </Layout>
        ) : (
          <Scrollable>
            {Object.entries(contentMap).map(([tileName, tileView], idx) => (
              <React.Fragment key={idx}>
                <Typography variant="h6" sx={{ padding: 1 }}>
                  {tileName}
                </Typography>
                {tileView}
              </React.Fragment>
            ))}
          </Scrollable>
        )}
      </Content>
    </Layout>
  );
}
