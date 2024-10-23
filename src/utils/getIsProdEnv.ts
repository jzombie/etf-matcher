export default function getIsProdEnv(): boolean {
  return import.meta.env.PROD;
}
