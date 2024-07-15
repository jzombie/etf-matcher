import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { buildTime } from "../public/buildTime.json";

// TODO: Refactor this handling (query `public/buildTime.json` from client, without caching,
// occasionally to determine if the app needs updating)
(() => {
  const jsBuildTime = buildTime;
  const htmlBuildTime = window.document
    .querySelector('meta[name="html_build_time"]')
    ?.getAttribute("content");

  if (jsBuildTime === htmlBuildTime) {
    console.debug("HTML and JS versions are in sync");
  } else {
    console.warn("HTML and JS versions are not in sync!", {
      jsBuildTime,
      htmlBuildTime,
    });
  }
})();

const container = window.document.getElementById("app");
createRoot(container!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// TODO: Remove
(() => {
  const worker = new SharedWorker(
    new URL("./utils/PROTO_sharedWorker.ts", import.meta.url),
    {
      type: "module",
    }
  );

  // Start the worker port
  worker.port.start();

  // Correctly assign the onmessage handler
  worker.port.onmessage = (event) => {
    console.log({ message: event.data });
  };

  worker.port.postMessage("hello");
})();
