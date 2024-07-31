import React from "react";

import { createRoot } from "react-dom/client";

import App from "./App";

const container = window.document.getElementById("app");
createRoot(container!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
