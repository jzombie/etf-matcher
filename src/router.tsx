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
