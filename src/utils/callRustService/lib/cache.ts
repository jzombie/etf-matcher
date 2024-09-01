import callRustService from "../callRustService";
import type { RustServiceCacheDetail } from "../types";

export async function clearCache(): Promise<void> {
  return callRustService("clear_cache");
}

export async function removeCacheEntry(key: string): Promise<void> {
  return callRustService("remove_cache_entry", [key]);
}

export async function fetchCacheSize(): Promise<number> {
  return callRustService<number>("get_cache_size");
}

export async function fetchCacheDetails(): Promise<RustServiceCacheDetail[]> {
  return callRustService<RustServiceCacheDetail[]>("get_cache_details");
}
