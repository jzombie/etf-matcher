import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./pages/About";

// TODO: For GitHub Pages: Check URL; if 404.html, redirect to non-404 with same path and query
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "about",
    element: <About />,
  },
]);

const container = document.getElementById("app");
createRoot(container!).render(<RouterProvider router={router} />);
