import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

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
