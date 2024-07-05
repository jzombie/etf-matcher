import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

// TODO: For GitHub Pages: Check URL; if 404.html, redirect to non-404 with same path and query
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "about",
    element: <div>About</div>,
  },
]);

const container = document.getElementById("app");
createRoot(container!).render(<RouterProvider router={router} />);
