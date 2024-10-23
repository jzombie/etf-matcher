/**
 * Retrieves the vale of an environment variable.
 *
 * This wrapper is used primarily to have a consistent way to handle errors if
 * the variable is not found.
 */
export default function getEnvVariable(key: string): string {
  // Ensure client-side env vars are prefixed with VITE_
  if (!key.startsWith("VITE_") && import.meta.env.DEV) {
    throw new Error(
      `Environment variable "${key}" should be prefixed with VITE_ for client-side usage.`,
    );
  }

  // All `VITE_` prefixed env vars are strings, but we'll cast them to a string
  // to ensure integrity
  const value = import.meta.env[key].toString();
  if (value === undefined) {
    throw new Error(`Environment variable "${key}" is not defined.`);
  }
  return value;
}
