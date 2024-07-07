// vitest.config.js
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
// import eslint from "vite-plugin-eslint";

console.warn("TODO: Enable eslint config in vitest.config.js");

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    // setupFiles: "./test/setup.ts", // optional, if you need setup files
  },
  plugins: [
    checker({ typescript: true }),
    tsconfigPaths(),

    // eslint()
  ],
});
