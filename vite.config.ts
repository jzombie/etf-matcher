import { writeBuildTime } from "./vite/common_prestart";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint";
import { createHtmlPlugin } from "vite-plugin-html";
import sitemap from "vite-plugin-sitemap";

import dotenv from "dotenv";

// This is needed to get the .env variables to populate here
dotenv.config();

const DESTINATION_DIR = path.resolve(__dirname, "dist");

export default defineConfig({
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
        data: {
          buildTime: writeBuildTime(), // Write build time to a file and inject it into HTML
        },
      },
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    sitemap({
      hostname: "https://etfmatcher.com",
      // TODO: Ideally these would seed automatically from `router.ts`
      dynamicRoutes: [
        "/",
        "/search",
        "/portfolios",
        "/watchlists",
        "/settings",
      ],
    }),
  ],
  // Resolve warnings with checker plugin (even though this is not a Vue project)
  define: {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
  },
});
