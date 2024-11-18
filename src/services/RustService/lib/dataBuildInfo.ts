import callRustService from "../callRustService";
import type { RustServiceDataBuildInfo } from "../rustServiceTypes";

export async function fetchDataBuildInfo(): Promise<RustServiceDataBuildInfo> {
  return callRustService<RustServiceDataBuildInfo>("get_data_build_info");
}
