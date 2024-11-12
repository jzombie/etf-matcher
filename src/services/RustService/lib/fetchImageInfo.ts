import callRustService from "../callRustService";
import type { RustServiceImageInfo } from "../rustServiceTypes";

export default async function fetchImageInfo(
  filename: string,
): Promise<RustServiceImageInfo> {
  return callRustService<RustServiceImageInfo>("get_image_info", [filename]);
}
