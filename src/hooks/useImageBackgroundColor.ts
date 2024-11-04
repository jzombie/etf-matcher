import { useEffect } from "react";

import { fetchImageInfo } from "@services/RustService";

import usePromise from "./usePromise";

// Derived from `image.rs` @ `format!("rgba({}, {}, {}, {})", r, g, b, a as f32 / 255.0)`
const FULLY_TRANSPARENT = "rgba(0, 0, 0, 0)";

export default function useImageBackgroundColor(
  imageFilename?: string,
): string | null {
  const { data: imageInfo, execute } = usePromise<{ rgba: string }, [string]>({
    fn: fetchImageInfo,
    autoExecute: false,
  });

  useEffect(() => {
    if (imageFilename) {
      execute(imageFilename);
    }
  }, [imageFilename, execute]);

  // If fully transparent, return null to allow components to handle this state
  return imageInfo && imageInfo.rgba !== FULLY_TRANSPARENT
    ? imageInfo.rgba
    : null;
}
