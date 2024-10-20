export default function getEnvVariable<T = string>(key: string): T {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable "${key}" is not defined.`);
  }
  return value;
}
