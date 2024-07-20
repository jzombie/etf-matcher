import "./vite/common_prestart";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
  plugins: [checker({ typescript: true }), tsconfigPaths()],
});
