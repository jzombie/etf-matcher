/**
 * Retrieves the vale of an environment variable.
 *
 * This wrapper is used primarily to have a consistent way to handle errors if
 * the variable is not found.
 */
export default function getEnvVariable<T = string>(key: string): T {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable "${key}" is not defined.`);
  }
  return value;
}
