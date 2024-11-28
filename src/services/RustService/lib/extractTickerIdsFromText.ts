import callRustService from "../callRustService";

// TODO: Rename and move into `searchTickers`
export default async function extractTickerIdsFromText(
  text: string,
): Promise<number[]> {
  return callRustService<number[]>("extract_search_results_from_text", [text]);
}
