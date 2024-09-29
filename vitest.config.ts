import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import { writeBuildTime } from "./vite.config";
import logger from "./vite.logger";

// Fixes an async issue where TypeScript complains about `public/buildTime.json`
// not being present.
//
// As of July 19, 2024, this doesn't currently fail the tests because it's out
// of scope of the current test cases, but the error is still raised asynchronously.
writeBuildTime();

export default defineConfig({
  customLogger: logger,
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
