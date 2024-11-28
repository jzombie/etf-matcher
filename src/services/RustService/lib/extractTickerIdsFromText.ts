import callRustService from "../callRustService";

export default async function extractTickerIdsFromText(
  text: string,
): Promise<number[]> {
  return callRustService<number[]>("extract_ticker_ids_from_text", [text]);
}
