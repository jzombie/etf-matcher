import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

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
    viteStaticCopy({
      targets: [
        {
          src: "./*",
          dest: DESTINATION_DIR,
        },
      ],
    }),
  ],
});
