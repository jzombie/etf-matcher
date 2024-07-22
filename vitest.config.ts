import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
import { writeBuildTime } from "./vite.config";

// Fixes an async issue where TypeScript complains about `public/buildTime.json`
// not being present.
//
// As of July 19, 2024, this doesn't currently fail the tests because it's out
// of scope of the current test cases, but the error is still raised asynchronously.
writeBuildTime();

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setupTests.ts",
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
  plugins: [checker({ typescript: true }), tsconfigPaths()],
});
