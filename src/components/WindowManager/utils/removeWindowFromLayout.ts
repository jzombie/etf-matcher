import { MosaicNode, MosaicParent } from "react-mosaic-component";

// Utility to remove a window from the layout and get its split percentage
export default function removeWindowFromLayout(
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
