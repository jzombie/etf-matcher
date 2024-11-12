import callRustService from "../callRustService";
import type { RustServiceTickerDetail } from "../rustServiceTypes";

export default async function fetchTickerDetail(
  tickerId: number,
): Promise<RustServiceTickerDetail> {
  return callRustService<RustServiceTickerDetail>("get_ticker_detail", [
    tickerId,
  ]);
}
