import React from "react";

import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode } from "react-mosaic-component";

import customLogger from "@utils/customLogger";

import WindowManagerBase from "./WindowManagerBase";
import useDetermineAutoTiling from "./hooks/useDetermineAutoTiling";
import useWindowManagerLayout from "./hooks/useWindowManagerLayout";

export type WindowManagerProps = {
  initialValue: MosaicNode<string>;
  contentMap: Record<string, React.ReactNode>;
};

export default function WindowManager({
  initialValue,
  contentMap,
}: WindowManagerProps) {
  const { isAutoTiling: isTiling, componentRef } = useDetermineAutoTiling();

  const {
    layout,
    setLayout,
    toggleWindow,
    areAllWindowsOpen,
    openedWindows,
    updateOpenWindows,
  } = useWindowManagerLayout({
    initialValue,
    contentMap,
  });

  return (
    <Full ref={componentRef}>
      <Layout>
        <Content>
          {isTiling ? (
            <Layout>
              <Content>
                <WindowManagerBase
                  initialValue={layout || initialValue}
                  contentMap={contentMap}
                  onChange={(newLayout) => {
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
    </Full>
  );
}
