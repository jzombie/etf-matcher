import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import Full from "@layoutKit/Full";
import Layout, { Content, Footer } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode, MosaicParent } from "react-mosaic-component";

import TickerContainer from "@components/TickerContainer";
import WindowManager, {
  addWindowToLayout,
  removeWindowFromLayout,
} from "@components/WindowManager";

import useResizeObserver from "@hooks/useResizeObserver";

import customLogger from "@utils/customLogger";

import TickerViewWindowManagerBucketManager from "./TickerViewWindowManager.BucketManager";
import useTickerViewWindowManagerContent from "./hooks/useTickerViewWindowManagerContent";

const TILING_MODE_MIN_WIDTH_THRESHOLD = 956;

export type TickerViewWindowManagerProps = {
  tickerId: number;
};

export default function TickerViewWindowManager({
  tickerId,
}: TickerViewWindowManagerProps) {
  const [isTiling, setIsTiling] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  useResizeObserver(componentRef, () => {
    const container = componentRef.current;
    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;

    const shouldTile = containerWidth >= TILING_MODE_MIN_WIDTH_THRESHOLD;

    if (shouldTile !== isTiling) {
      setIsTiling(shouldTile);
    }
  });

  const { initialValue, contentMap, tickerDetail } =
    useTickerViewWindowManagerContent(tickerId, isTiling);

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

  const areAllWindowsOpen =
    Array.from(openWindows).length === Object.values(contentMap).length;

  return (
    <Full ref={componentRef}>
      <TickerContainer tickerId={tickerId}>
        <Layout>
          <Content>
            {isTiling ? (
              <Layout>
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
                {!areAllWindowsOpen && (
                  <Footer>
                    <Box sx={{ overflow: "auto" }}>
                      {/* Dynamically generate buttons based on contentMap */}
                      <ToggleButtonGroup
                        value={Array.from(openWindows)} // Convert openWindows to array
                        aria-label="window selection"
                        sx={{ float: "right" }}
                      >
                        {Object.keys(contentMap).map((key) => {
                          if (openWindows.has(key)) {
                            return null;
                          }

                          return (
                            <ToggleButton
                              key={key}
                              value={key}
                              disabled={openWindows.has(key)} // Disable button if the window is open
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
                {tickerDetail && (
                  <TickerViewWindowManagerBucketManager
                    tickerDetail={tickerDetail}
                  />
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
                {tickerDetail && (
                  <TickerViewWindowManagerBucketManager
                    tickerDetail={tickerDetail}
                  />
                )}
              </Scrollable>
            )}
          </Content>
        </Layout>
      </TickerContainer>
    </Full>
  );
}
