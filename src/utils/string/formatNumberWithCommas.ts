import { DEFAULT_LOCALE } from "@src/constants";

export default (() => {
  // WeakMap to store NumberFormat objects keyed by locale objects
  const numberFormatMap = new WeakMap<object, Intl.NumberFormat>();

  // Object to store locale keys for the WeakMap
  const localeKeyMap = new Map<string, object>();

  const getLocaleKey = (locale: string): object => {
    if (localeKeyMap.has(locale)) {
      return localeKeyMap.get(locale)!;
    }
    const localeKey = {};
    localeKeyMap.set(locale, localeKey);
    return localeKey;
  };

  const getNumberFormatter = (locale: string) => {
    const localeKey = getLocaleKey(locale);

    // Check if the formatter for the given locale object is already in the WeakMap
    if (numberFormatMap.has(localeKey)) {
      return numberFormatMap.get(localeKey)!;
    }

    // Create a new formatter and store it in the WeakMap
    const formatter = new Intl.NumberFormat(locale);
    numberFormatMap.set(localeKey, formatter);
    return formatter;
  };

  const formatNumberWithCommas = (
    value: string,
    locale: string = DEFAULT_LOCALE,
  ) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return value; // Return the original string if it's not a valid number
    }

    // Get the formatter for the given locale
    const formatter = getNumberFormatter(locale);
    return formatter.format(numericValue);
  };

  return formatNumberWithCommas;
})();
