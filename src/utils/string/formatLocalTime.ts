import LRUCache from "../LRUCache";

const lruCache = new LRUCache<string, string>(100);

export default function formatLocalTime(timestamp: string): string {
  // Check if the formatted date is already cached
  const cachedDate = lruCache.get(timestamp);
  if (cachedDate) {
    return cachedDate;
  }

  // Convert the ISO string to a Date object
  const date = new Date(timestamp);

  // Format the date to a locale string with time zone information
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  }).format(date);

  // Cache the formatted date
  lruCache.set(timestamp, formattedDate);

  return formattedDate;
}
