import callRustService from "../callRustService";
import type {
  RustServicePaginatedResults,
  RustServiceTickerSearchResult,
} from "../rustServiceTypes";

export default async function searchTickers(
  query: string,
  page: number = 1,
  pageSize: number = 20,
  onlyExactMatches: boolean = false,
  abortSignal?: AbortSignal,
): Promise<RustServicePaginatedResults<RustServiceTickerSearchResult>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceTickerSearchResult>
  >(
    "search_tickers",
    [query.trim(), page, pageSize, onlyExactMatches],
    abortSignal,
  );
}

export async function extractSearchResultsFromText(
  text: string,
  page: number = 1,
  pageSize: number = 20,
  abortSignal?: AbortSignal,
): Promise<RustServicePaginatedResults<RustServiceTickerSearchResult>> {
  return callRustService<
    RustServicePaginatedResults<RustServiceTickerSearchResult>
  >("extract_search_results_from_text", [text, page, pageSize], abortSignal);
}
