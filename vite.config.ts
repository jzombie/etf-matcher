import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import eslint from "vite-plugin-eslint";
import { createHtmlPlugin } from "vite-plugin-html";
import sitemap from "vite-plugin-sitemap";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

import {
  INVESTMENT_DISCLAIMER,
  PROJECT_AUTHOR,
  PROJECT_AUTHOR_LINKEDIN_URL,
  PROJECT_AUTHOR_NAME,
  PROJECT_AUTHOR_TYPE,
  PROJECT_DEFAULT_TITLE,
  PROJECT_DESCRIPTION,
  PROJECT_GITHUB_REPOSITORY,
  PROJECT_NAME,
  PROJECT_URL,
} from "./src/constants";
import logger from "./vite.logger";

// This is needed to get the .env variables to populate here
dotenv.config();

// Function to get the current build time and write it to a file
export function writeBuildTime() {
  const now = new Date();
  const buildTime = now.toISOString(); // Returns the build time in ISO format
  fs.writeFileSync(
    path.resolve(__dirname, "public/buildTime.json"),
    JSON.stringify({ buildTime }),
  );
  return buildTime;
}

// Note: These replace `<%= MY_VAR %>` usage inside of `index.html`.
const HTML_REPLACEMENTS = {
  BUILD_TIME: writeBuildTime(),
  PROJECT_DEFAULT_TITLE,
  PROJECT_DESCRIPTION,
  PROJECT_AUTHOR,
  PROJECT_GITHUB_REPOSITORY,
  PROJECT_URL,
  PROJECT_AUTHOR_NAME,
  PROJECT_AUTHOR_TYPE,
  PROJECT_AUTHOR_LINKEDIN_URL,
  INVESTMENT_DISCLAIMER,
};

// Note: These are *intentionally* lower-case keys, and are injected directly
// into the sitemap.json in the `dist` directory during a production build.
const MANIFEST_VARS = {
  name: PROJECT_NAME,
  short_name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  background_color: process.env.VITE_BACKGROUND_COLOR || "#000000",
  theme_color: process.env.VITE_BACKGROUND_COLOR || "#000000",
};

export default defineConfig(({ mode }) => {
  const DESTINATION_DIR = path.resolve(__dirname, "dist");
  const IS_PROD = mode === "production";

  const MANIFEST_TEMPLATE_PATH = path.resolve(
    __dirname,
    "src",
    "manifest.template.json",
  );

  return {
    customLogger: logger,
    root: "./public",
    publicDir: false, // Disable the default publicDir handling
    build: {
      rollupOptions: {
        input: "./public/index.html",
        output: {
          dir: DESTINATION_DIR, // Adjust the output directory to be outside of the public folder
          format: "es",
        },
      },
      emptyOutDir: true, // Ensure the output directory is emptied before each build
    },
    worker: {
      format: "es",
    },
    preview: {
      port: 8000,
      headers: {
        "Content-Encoding": "gzip",
      },
    },
    server: {
      host: "0.0.0.0",
      port: 8000,
      watch: {
        // Ignoring this because of the large amount of files present in here, leading
        // to stack overflow issues at times when rebuilding the data.
        // (`viteStaticCopy` may need to be configured to work around this as well)
        ignored: ["public/data"],
      },
    },
    plugins: [
      react(),
      checker({ typescript: true }),
      tsconfigPaths(),
      eslint({
        failOnError: false, // Show errors in console but do not fail build
        failOnWarning: false, // Show warnings in console but do not fail build
        cache: false, // Ensure ESLint re-evaluates on every save
        fix: true, // Automatically fix linting errors where possible
      }),
      svgr(),
      createHtmlPlugin({
        inject: {
          data: HTML_REPLACEMENTS,
        },
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      ...(IS_PROD
        ? [
            viteStaticCopy({
              targets: [
                {
                  src: "favicon.ico",
                  dest: path.resolve(DESTINATION_DIR),
                },
                {
                  src: "CNAME",
                  dest: path.resolve(DESTINATION_DIR),
                },
                {
                  src: "buildTime.json",
                  dest: path.resolve(DESTINATION_DIR),
                },
                {
                  src: "./static/*",
                  dest: path.resolve(DESTINATION_DIR, "static"),
                },
                {
                  src: "./data/*",
                  dest: path.resolve(DESTINATION_DIR, "data"),
                },
                {
                  src: "./pkg/*",
                  dest: path.resolve(DESTINATION_DIR, "pkg"),
                },
                {
                  src: "README.md",
                  dest: path.resolve(DESTINATION_DIR),
                },
              ],
            }),
            {
              name: "inject-manifest-variables",
              // Using `closeBundle` to ensure the manifest.json file is written at the end
              // of the build process. This avoids potential conflicts with other plugins
              // (such as `sitemap`) that also modify files in the output directory during the
              // build. The `closeBundle` hook is triggered after all the build steps are
              // completed, ensuring the manifest is generated and written to the `dist`
              // folder after everything else is finalized.

              closeBundle() {
                // Check if the manifest template exists
                if (fs.existsSync(MANIFEST_TEMPLATE_PATH)) {
                  const manifestContent = JSON.parse(
                    fs.readFileSync(MANIFEST_TEMPLATE_PATH, "utf-8"),
                  );

                  // Write the updated manifest to the output folder
                  const filePath = path.resolve(
                    DESTINATION_DIR,
                    "manifest.json",
                  );
                  fs.writeFileSync(
                    filePath,
                    JSON.stringify(
                      { ...MANIFEST_VARS, ...manifestContent },
                      null,
                      2,
                    ),
                  );
                } else {
                  throw new Error(
                    `Manifest template not found at ${MANIFEST_TEMPLATE_PATH}`,
                  );
                }
              },
            },
            sitemap({
              hostname: PROJECT_URL,
              // TODO: Ideally these would seed automatically from `router.ts`
              dynamicRoutes: [
                "/",
                "/search",
                "/portfolios",
                "/portfolio/my-portfolio",
                "/watchlists",
                "/watchlist/my-watchlist",
                "/settings",
                "/contact",
              ],
            }),
          ]
        : []),
    ],
    // Resolve warnings with checker plugin (even though this is not a Vue project)
    define: {
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    },
  };
});
