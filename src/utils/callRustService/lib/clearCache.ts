import callRustService from "../callRustService";

export default function clearCache(): Promise<void> {
  return callRustService("clear_cache");
}
