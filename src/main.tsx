import React from "react";

import callRustService from "@services/RustService";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = window.document.getElementById("app");
createRoot(container!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// TODO: Remove
callRustService("get_all_ticker_vector_configs", []).then(
  (tickerVectorConfigs) => {
    console.log({ tickerVectorConfigs });
  },
);
