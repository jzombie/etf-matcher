import LRUCache from './LRUCache';

const numberFormatCache = new LRUCache<string, Intl.NumberFormat>(100);

export default function formatCurrency(
  currencyCode: string,
  monetaryValue: number
) {
  let formatter = numberFormatCache.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    });
    numberFormatCache.set(currencyCode, formatter);
  }

  const abbreviateNumber = (value: number) => {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
    return value.toFixed(2);
  };

  const abbreviatedValue = abbreviateNumber(monetaryValue);

  // To include currency symbol with abbreviation
  const parts = formatter.formatToParts(monetaryValue);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || "";

  return `${currencySymbol}${abbreviatedValue}`;
}
