import React from "react";

import Home from "@pages/Home";
import NotFound from "@pages/NotFound";
import Portfolios from "@pages/Portfolios";
import SearchResults from "@pages/SearchResults";
import Settings from "@pages/Settings";
import Watchlists from "@pages/Watchlists";
import { RouteObject, createBrowserRouter } from "react-router-dom";

import MainLayout from "@components/MainLayout";
import { SharedSessionManagerProvider } from "@components/SharedSessionManager";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      // Note: `SharedSessionManagerProvider` is placed here instead of in `App`
      // due to being dependent on `React Router`.
      <SharedSessionManagerProvider>
        <MainLayout />
      </SharedSessionManagerProvider>
    ),
    children: [
      {
        path: "",
        element: <Home />,
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
        path: "watchlists",
        element: <Watchlists />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "*",
        element: <NotFound />, // This is the catch-all route
      },
    ],
  },
];

export default createBrowserRouter(routes);
