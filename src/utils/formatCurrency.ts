import LRUCache from "./LRUCache";

const numberFormatCache = new LRUCache<string, Intl.NumberFormat>(100);

export default function formatCurrency(
  currencyCode: string,
  monetaryValue: number,
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
    const absValue = Math.abs(value);
    let abbreviatedValue;

    if (absValue >= 1e12) abbreviatedValue = (absValue / 1e12).toFixed(2) + "T";
    else if (absValue >= 1e9)
      abbreviatedValue = (absValue / 1e9).toFixed(2) + "B";
    else if (absValue >= 1e6)
      abbreviatedValue = (absValue / 1e6).toFixed(2) + "M";
    else if (absValue >= 1e3)
      abbreviatedValue = (absValue / 1e3).toFixed(2) + "K";
    else abbreviatedValue = absValue.toFixed(2);

    return value < 0 ? `-${abbreviatedValue}` : abbreviatedValue;
  };

  const abbreviatedValue = abbreviateNumber(monetaryValue);

  // To include currency symbol with abbreviation
  const parts = formatter.formatToParts(monetaryValue);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || "";

  return `${currencySymbol}${abbreviatedValue}`;
}
