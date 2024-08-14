export default function adjustRGBAOpacity(
  rgbaString: string,
  newOpacity: number,
) {
  // Use a regular expression to extract the rgba values
  const rgbaMatch = rgbaString.match(
    /rgba\((\d+), (\d+), (\d+), (\d+|\d*\.?\d+)\)/,
  );

  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    // Ensure the newOpacity is between 0 and 1
    const a = Math.max(0, Math.min(1, newOpacity));

    // Return the new rgba string with the adjusted opacity
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // If the input string was not a valid rgba string, return it unchanged
  return rgbaString;
}
