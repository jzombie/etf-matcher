import { useEffect, useState } from "react";

import { fetchImageInfo } from "@services/RustService";

// Derived from `image.rs` @ `format!("rgba({}, {}, {}, {})", r, g, b, a as f32 / 255.0)`
const FULLY_TRANSPARENT = "rgba(0, 0, 0, 0)";

export default function useImageBackgroundColor(
  imageFilename?: string,
): string | null {
  const [imageBackgroundColor, setImageBackgroundColor] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (imageFilename) {
      fetchImageInfo(imageFilename).then((imageInfo) => {
        // If fully transparent, just return null (this is so that components
        // can determine their own handling for fully-transparent background
        // states [i.e. `SymbolDetail` currently relies on this])
        if (imageInfo.rgba !== FULLY_TRANSPARENT) {
          setImageBackgroundColor(imageInfo.rgba);
        }
      });
    }
  }, [imageFilename]);

  return imageBackgroundColor;
}
