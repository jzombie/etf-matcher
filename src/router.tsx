import Home from "./pages/Home";
import About from "./pages/About";
import { createBrowserRouter } from "react-router-dom";

// TODO: For GitHub Pages: Check URL; if 404.html, redirect to non-404 with same path and query
export default createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "about",
    element: <About />,
  },
]);
