import callRustService from "../callRustService";

export async function generateQRCode(data: string): Promise<string> {
  return callRustService<string>("generate_qr_code", [data]);
}
