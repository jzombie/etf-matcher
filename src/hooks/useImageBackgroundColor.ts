import { useState, useEffect } from "react";
import store from "@src/store";

// Derived from `image.rs` @ `format!("rgba({}, {}, {}, {})", r, g, b, a as f32 / 255.0)`
const FULLY_TRANSPARENT = "rgba(0, 0, 0, 0)";

export default function useImageBackgroundColor(
  imageFilename?: string
): string | null {
  const [imageBackgroundColor, setImageBackgroundColor] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (imageFilename) {
      store.fetchImageInfo(imageFilename).then((imageInfo) => {
        // If fully transparent, just return null
        if (imageInfo.rgba !== FULLY_TRANSPARENT) {
          setImageBackgroundColor(imageInfo.rgba);
        }
      });
    }
  }, [imageFilename]);

  return imageBackgroundColor;
}
