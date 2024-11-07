import { useCallback, useEffect, useState } from "react";

import { MosaicNode, MosaicParent } from "react-mosaic-component";

import addWindowToLayout from "../utils/addWindowToLayout";
import removeWindowFromLayout from "../utils/removeWindowFromLayout";

export type UseWindowManagerLayoutProps = {
  initialLayout: MosaicNode<string> | null;
  contentMap: Record<string, React.ReactNode>;
};

export default function useWindowManagerLayout({
  initialLayout,
  contentMap,
}: UseWindowManagerLayoutProps) {
  // Track layout, open windows, saved layouts, and split percentages
  const [layout, setLayout] = useState<MosaicNode<string> | null>(null);
  const [openedWindows, setOpenedWindows] = useState<Set<string>>(new Set());
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
    setOpenedWindows(openWindowSet);
  }, []);

  // Toggle window open/close
  const toggleWindow = useCallback(
    (windowId: string) => {
      if (openedWindows.has(windowId)) {
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
          setOpenedWindows((prev) => new Set(prev).add(windowId));
          return newLayout;
        });
      }
    },
    [openedWindows, savedLayouts, splitPercentages],
  );

  useEffect(() => {
    setLayout(initialLayout);
    updateOpenWindows(initialLayout); // Initialize open windows
  }, [contentMap, initialLayout, updateOpenWindows]);

  const areAllWindowsOpen =
    Array.from(openedWindows).length === Object.values(contentMap).length;

  return {
    layout,
    setLayout,
    toggleWindow,
    areAllWindowsOpen,
    openedWindows,
    updateOpenWindows,
  };
}
