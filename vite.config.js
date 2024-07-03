import { defineConfig } from "vite";

export default defineConfig({
  root: "./public",
  build: {
    rollupOptions: {
      input: "./public/index.html",
      output: {
        dir: "dist",
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
});
