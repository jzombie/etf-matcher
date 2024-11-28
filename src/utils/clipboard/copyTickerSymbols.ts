export default async function copyTickerSymbols(
  tickerSymbols: string[],
): Promise<void> {
  const symbolsText = tickerSymbols.join(", ");

  return navigator.clipboard.writeText(symbolsText);
}
