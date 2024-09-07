import React, { useCallback, useEffect, useState } from "react";

import { Box, Button } from "@mui/material";

import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import { MosaicNode, MosaicParent } from "react-mosaic-component";

import TickerContainer from "@components/TickerContainer";
import WindowManager from "@components/WindowManager";

import customLogger from "@utils/customLogger";

import TickerViewWindowManagerBucketManager from "./TickerViewWindowManager.BucketManager";
import useTickerViewWindowManagerContent from "./useTickerViewWindowManagerContent";

export type TickerViewWindowManagerProps = {
  tickerId: number;
};

export default function TickerViewWindowManager({
  tickerId,
}: TickerViewWindowManagerProps) {
  const { initialValue, contentMap, tickerDetail } =
    useTickerViewWindowManagerContent(tickerId);

  // Track layout, open windows, saved layouts, and split percentages
  const [layout, setLayout] = useState<MosaicNode<string> | null>(null);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());
  const [savedLayouts, setSavedLayouts] = useState<
    Record<string, MosaicNode<string>>
  >({});
  const [splitPercentages, setSplitPercentages] = useState<
    Record<string, number>
  >({});

  // Update open windows based on the current layout
  const updateOpenWindows = useCallback((layout: MosaicNode<string> | null) => {
    const findOpenWindows = (node: MosaicNode<string> | null): string[] => {
      if (!node) return [];
      if (typeof node === "string") return [node];
      return [
        ...findOpenWindows((node as MosaicParent<string>).first),
        ...findOpenWindows((node as MosaicParent<string>).second),
      ];
    };

    const openWindowSet = new Set(findOpenWindows(layout));
    setOpenWindows(openWindowSet);
  }, []);

  // Toggle window open/close
  const toggleWindow = useCallback(
    (windowId: string) => {
      if (openWindows.has(windowId)) {
        // Save the window's layout and splitPercentage before closing
        setLayout((prevLayout) => {
          const newLayout = removeWindowFromLayout(
            prevLayout,
            windowId,
            (splitPercentage) => {
              if (splitPercentage) {
                setSplitPercentages((prev) => ({
                  ...prev,
                  [windowId]: splitPercentage,
                }));
              }
            },
          );
          setSavedLayouts((prev) => ({
            ...prev,
            [windowId]: prevLayout!,
          }));
          return newLayout;
        });
      } else {
        // Re-open the window at its previous position with its previous splitPercentage
        setLayout((prevLayout) => {
          const restoredLayout = savedLayouts[windowId] || windowId;
          const newLayout = addWindowToLayout(
            prevLayout,
            restoredLayout,
            splitPercentages[windowId],
          );
          setOpenWindows((prev) => new Set(prev).add(windowId));
          return newLayout;
        });
      }
    },
    [openWindows, savedLayouts, splitPercentages],
  );

  useEffect(() => {
    setLayout(initialValue);
    updateOpenWindows(initialValue); // Initialize open windows
  }, [contentMap, initialValue, updateOpenWindows]);

  return (
    <TickerContainer tickerId={tickerId}>
      <Layout>
        <Header>
          {/* Dynamically generate buttons based on contentMap */}
          <Box>
            {Object.keys(contentMap).map((key) => (
              <Button
                key={key}
                variant="contained"
                disabled={openWindows.has(key)} // Disable if window is open
                onClick={() => toggleWindow(key)} // Toggle window on click
                style={{ margin: "0 8px" }}
              >
                {key}
              </Button>
            ))}
          </Box>
        </Header>

        <Content>
          <WindowManager
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

        <Footer>
          {tickerDetail && (
            <TickerViewWindowManagerBucketManager tickerDetail={tickerDetail} />
          )}
        </Footer>
      </Layout>
    </TickerContainer>
  );
}

// Utility to remove a window from the layout and get its split percentage
function removeWindowFromLayout(
  layout: MosaicNode<string> | null,
  windowId: string,
  saveSplitPercentage?: (splitPercentage: number | undefined) => void,
): MosaicNode<string> | null {
  if (!layout) return null;

  if (typeof layout === "string") {
    return layout === windowId ? null : layout;
  }

  const { first, second, direction, splitPercentage } =
    layout as MosaicParent<string>;

  if (saveSplitPercentage) {
    saveSplitPercentage(splitPercentage);
  }

  const newFirst = removeWindowFromLayout(first, windowId, saveSplitPercentage);
  const newSecond = removeWindowFromLayout(
    second,
    windowId,
    saveSplitPercentage,
  );

  if (!newFirst && !newSecond) return null;
  if (!newFirst) return newSecond;
  if (!newSecond) return newFirst;

  return { first: newFirst, second: newSecond, direction, splitPercentage };
}

// Utility to restore/add a window to its previous layout position
function addWindowToLayout(
  layout: MosaicNode<string> | null,
  windowLayout: MosaicNode<string>,
  splitPercentage?: number,
): MosaicNode<string> | null {
  if (!layout) {
    return windowLayout; // Add the window if layout is null
  }

  return {
    direction: "row",
    first: layout,
    second: windowLayout,
    splitPercentage: splitPercentage || 75, // Use saved splitPercentage or default to 50
  };
}
