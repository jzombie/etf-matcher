export default function formatLocalTime(timestamp: string) {
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

  return formattedDate;
}
