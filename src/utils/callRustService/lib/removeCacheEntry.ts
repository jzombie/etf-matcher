import callRustService from "../callRustService";

export default function removeCacheEntry(key: string): Promise<void> {
  return callRustService("remove_cache_entry", [key]);
}
