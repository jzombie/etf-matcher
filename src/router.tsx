import React from "react";

import ContactUsPage from "@pages/ContactUs.page";
import HomePage from "@pages/Home.page";
import NotFoundPage from "@pages/NotFound.page";
import PortfoliosPage from "@pages/Portfolios.page";
import SearchResultsPage from "@pages/SearchResults.page";
import SettingsPage from "@pages/Settings.page";
import TickerBucketPage from "@pages/TickerBucket.page";
import WatchlistsPage from "@pages/Watchlists.page";
import TickerBucketImportExportProvider from "@providers/TickerBucketImportExportProvider";
import { RouteObject, createBrowserRouter } from "react-router-dom";

import MainLayout from "@components/MainLayout";
import { SharedSessionManagerProvider } from "@components/SettingsManager/SharedSessionManager";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      // Note: `SharedSessionManagerProvider` is placed here instead of in `App`
      // due to being dependent on `React Router`.
      <SharedSessionManagerProvider>
        <TickerBucketImportExportProvider>
          <MainLayout />
        </TickerBucketImportExportProvider>
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
        // All portfolios
        path: "portfolios",
        element: <PortfoliosPage />,
      },
      {
        // A specific portfolio
        path: "portfolios/:bucketName",
        element: <TickerBucketPage bucketType="portfolio" />,
      },
      {
        // All watchlists
        path: "watchlists",
        element: <WatchlistsPage />,
      },
      {
        // A specific watchlist
        path: "watchlists/:bucketName",
        element: <TickerBucketPage bucketType="watchlist" />,
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
