export const SYMBOL_THIRD_PARTY_PROVIDERS = [
  "stockanalysis.com",
  "google.com",
] as const;

// Define a type for the providers
type TickerSymbolThirdPartyProvider =
  (typeof SYMBOL_THIRD_PARTY_PROVIDERS)[number];

export type GetSymbolThirdPartyLinkProps = {
  tickerSymbol: string;
  companyName: string;
  isETF: boolean;
  provider: TickerSymbolThirdPartyProvider;
};

export default function getSymbolThirdPartyLink({
  tickerSymbol,
  companyName,
  isETF,
  provider,
}: GetSymbolThirdPartyLinkProps): string {
  switch (provider) {
    case "stockanalysis.com":
      return isETF
        ? `https://stockanalysis.com/etf/${encodeURIComponent(tickerSymbol)}/`
        : `https://stockanalysis.com/stocks/${encodeURIComponent(tickerSymbol)}/`;

    case "google.com":
      return `https://www.google.com/search?q=${encodeURIComponent(
        `${companyName} ${tickerSymbol}`,
      )}`;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
