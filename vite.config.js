import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "./index.html",
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
