import Home from "./pages/Home";
import About from "./pages/About";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@components/Layout";

// TODO: For GitHub Pages: Check URL; if 404.html, redirect to non-404 with same path and query
export default createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Use Layout as the main wrapper
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
]);
