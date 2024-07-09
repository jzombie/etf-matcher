import React from "react";
import Home from "@pages/Home";
import Sectors from "@pages/Sectors";
import Portfolios from "@pages/Portfolios";
import SearchResults from "@pages/SearchResults";
import SectorDetail from "@pages/SectorDetail";
import About from "@pages/About";
import NotFound from "@pages/NotFound";

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
        path: "sectors",
        element: <Sectors />,
        children: [
          {
            path: ":sectorName",
            element: <SectorDetail />,
          },
        ],
      },
      {
        path: "search",
        element: <SearchResults />,
      },
      {
        path: "portfolios",
        element: <Portfolios />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "*",
        element: <NotFound />, // This is the catch-all route
      },
    ],
  },
]);

// Example flow if adding view transitions between routes:
//
// export default createBrowserRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     children: [
//       {
//         path: "",
//         element: <TransitionWrapper />,
//         children: [
//           {
//             path: "",
//             element: <Home />,
//           },
//           {
//             path: "about",
//             element: <About />,
//           },
//         ],
//       },
//     ],
//   },
// ]);
//
// In the implementation, notice the usage of <Outlet /> for the children slotting.
//
// const TransitionWrapper = () => {
//   const location = useLocation();

//   return (
//     <TransitionGroup>
//       <CSSTransition
//         key={location.key}
//         timeout={300}
//         classNames={{
//           enter: styles['fade-enter'],
//           enterActive: styles['fade-enter-active'],
//           exit: styles['fade-exit'],
//           exitActive: styles['fade-exit-active'],
//         }}
//       >
//         <Outlet />
//       </CSSTransition>
//     </TransitionGroup>
//   );
// };
