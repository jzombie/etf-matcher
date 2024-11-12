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
