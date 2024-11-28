export default async function copySymbols(symbols: string[]): Promise<void> {
  const symbolsText = symbols.join(", ");

  return navigator.clipboard.writeText(symbolsText);
}
