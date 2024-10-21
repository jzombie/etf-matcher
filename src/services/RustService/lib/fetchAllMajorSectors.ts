import callRustService from "../callRustService";

export default async function fetchAllMajorSectors(): Promise<
  Map<number, string>
> {
  return callRustService<Promise<Map<number, string>>>("get_all_major_sectors");
}
