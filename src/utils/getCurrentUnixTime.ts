/**
 * Gets the current Unix time in seconds.
 *
 * @returns The current Unix time as a number.
 */
export default function getCurrentUnixTime(): number {
  return Math.floor(Date.now() / 1000);
}
