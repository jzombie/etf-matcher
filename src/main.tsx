import React from "react";

import { createRoot } from "react-dom/client";

import customLogger from "@utils/customLogger";

import App from "./App";

const container = window.document.getElementById("app");
createRoot(container!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// TODO: Move this to extend `IndexedDBInterface` with a way to sync updates across browser tabs
(() => {
  const worker = new SharedWorker(
    new URL("./utils/PROTO_sharedWorker.ts", import.meta.url),
    {
      type: "module",
    },
  );

  // Start the worker port
  worker.port.start();

  // Correctly assign the onmessage handler
  worker.port.onmessage = (event) => {
    // Not really a warn but keeping this for now
    customLogger.warn({ message: event.data });
  };

  worker.port.postMessage("hello");
})();
