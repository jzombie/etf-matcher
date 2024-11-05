import callRustService from "../callRustService";

export default async function fetchLevenshteinDistance(
  strA: string,
  strB: string,
): Promise<number> {
  return callRustService<number>("levenshtein_distance", [strA, strB]);
}
