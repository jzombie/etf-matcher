import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

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
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./data/*",
          dest: path.resolve(DESTINATION_DIR, "data"),
        },
        {
          src: "./pkg/*",
          dest: path.resolve(DESTINATION_DIR, "pkg"),
        },
      ],
    }),
    checker({ typescript: true }),
  ],
  // Resolve warnings with checker plugin (even though this is not a Vue project)
  define: {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
  },
});
