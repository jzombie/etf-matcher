import callRustService from "../callRustService";

export default async function fetchAllMajorSectors() {
  // TODO: Add typings
  return callRustService("get_all_major_sectors");
}
