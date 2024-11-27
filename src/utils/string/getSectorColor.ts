import { COLOR_WHEEL_COLORS } from "@src/constants";

/**
 * A function that assigns consistent and unique colors to sector names, reusing
 * colors in a cyclic fashion if all available colors are exhausted.
 *
 * - Each sector name always maps to the same color (consistency).
 * - Colors are reused cyclically when all available colors are assigned (resilience).
 *
 * @returns A function that takes a sector name and returns a consistent color.
 */
const getSectorColor = (() => {
  const assignedColors = new Map<string, string>(); // Tracks sector-to-color mappings.
  let currentIndex = 0; // Tracks the next color to assign when all colors are used.

  return function getSectorColor(sectorName: string): string {
    // If the sector name already has a color assigned, return it.
    if (assignedColors.has(sectorName)) {
      return assignedColors.get(sectorName)!;
    }

    // Assign the next color in the cycle.
    const assignedColor = COLOR_WHEEL_COLORS[currentIndex];
    assignedColors.set(sectorName, assignedColor);

    // Update the index to the next color, wrapping around if necessary.
    currentIndex = (currentIndex + 1) % COLOR_WHEEL_COLORS.length;

    return assignedColor;
  };
})();

export default getSectorColor;
