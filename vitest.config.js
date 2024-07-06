// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    // setupFiles: "./test/setup.ts", // optional, if you need setup files
  },
});
