// Format the time as a string (e.g., "00:00:00")
export default function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error("Input must be a non-negative number");
  }

  // Handle potential overflow for very large numbers
  if (seconds > Number.MAX_SAFE_INTEGER) {
    return "99:59:59";
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hrs, mins, secs].map((val) => String(val).padStart(2, "0")).join(":");
}
