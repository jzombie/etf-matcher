import callRustService from "../callRustService";

export default async function fetchAllSectors() {
  // TODO: Add typings
  return callRustService("get_all_sectors");
}
