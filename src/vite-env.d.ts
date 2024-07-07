/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  // Add other environment variables if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
