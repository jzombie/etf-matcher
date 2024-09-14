import React from "react";

import ContactUsPage from "@pages/ContactUs.page";
import HomePage from "@pages/Home.page";
import NotFoundPage from "@pages/NotFound.page";
import PortfoliosPage from "@pages/Portfolios.page";
import SearchResultsPage from "@pages/SearchResults.page";
import SettingsPage from "@pages/Settings.page";
import WatchlistsPage from "@pages/Watchlists.page";
import BucketImportExportProvider from "@providers/BucketImportExportProvider";
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
        <BucketImportExportProvider>
          <MainLayout />
        </BucketImportExportProvider>
      </SharedSessionManagerProvider>
    ),
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "contact",
        element: <ContactUsPage />,
      },
      {
        path: "search",
        element: <SearchResultsPage />,
      },
      {
        path: "portfolios",
        element: <PortfoliosPage />,
      },
      {
        path: "watchlists",
        element: <WatchlistsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />, // This is the catch-all route
      },
    ],
  },
];

export default createBrowserRouter(routes);
