import callRustService from "../callRustService";
import type { RustServiceTicker10KDetail } from "../rustServiceTypes";

export default async function fetchTicker10KDetail(
  tickerId: number,
): Promise<RustServiceTicker10KDetail> {
  return callRustService<RustServiceTicker10KDetail>("get_ticker_10k_detail", [
    tickerId,
  ]);
}
