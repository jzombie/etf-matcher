import { MosaicNode } from "react-mosaic-component";

// Utility to restore/add a window to its previous layout position
export default function addWindowToLayout(
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
