import getIsClipboardAvailable from "./getIsClipboardAvailable";

export default async function copyTickerSymbols(
  tickerSymbols: string[],
): Promise<void> {
  if (!getIsClipboardAvailable()) {
    throw new Error("Clipboard API is not available");
  }

  const symbolsText = tickerSymbols.join(", ");

  return navigator.clipboard.writeText(symbolsText);
}
