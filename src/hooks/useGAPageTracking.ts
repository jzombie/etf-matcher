import { useEffect } from "react";

import store from "@src/store";

import customLogger from "@utils/customLogger";
import getEnvVariable from "@utils/getEnvVariable";
import getIsProdEnv from "@utils/getIsProdEnv";

const PAGE_VIEW_TIMEOUT = 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gtag = (window as { [key: string]: any })._gtag;

const IS_GTAG_ENABLED = typeof gtag === "function";

// Note: This intentionally does not use `react-router` events so that it
// doesn't have to be a child of a `react-router` context.
export default function useGAPageTracking() {
  useEffect(() => {
    if (!getIsProdEnv()) {
      customLogger.warn(
        "Skipping GA page tracking due to development environment.",
      );

      return;
    }

    if (!getEnvVariable("VITE_GOOGLE_ANALYTICS_ID")) {
      customLogger.warn(
        "`GOOGLE_ANALYTICS_ID` was not obtained. Skipping GA page tracking.",
      );

      return;
    }

    if (!IS_GTAG_ENABLED) {
      customLogger.warn("`gtag` is not enabled. Skipping GA page tracking.");
      return;
    }

    // Function to send page view to Google Analytics
    const sendPageView = () => {
      // A timeout is used here to account for any async page title changes
      setTimeout(() => {
        gtag("event", "page_view", {
          page_path:
            window.location.pathname +
            window.location.search +
            window.location.hash,
          page_title: window.document.title,
          page_location: window.location.href,
        });
      }, PAGE_VIEW_TIMEOUT);
    };

    // Track initial page load
    sendPageView();

    // Listen for popstate event
    const onPopState = () => {
      sendPageView();
    };
    window.addEventListener("popstate", onPopState);

    // Listen for hashchange event
    const onHashChange = () => {
      sendPageView();
    };
    window.addEventListener("hashchange", onHashChange);

    // Monkey-patch pushState to track navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      sendPageView();
    };

    // Monkey-patch replaceState to track navigation
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      sendPageView();
    };

    // Notify store that page tacking is now enabled
    store.setState({ isGAPageTrackingEnabled: true });

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;

      // Notify store that page tacking is now disabled
      store.setState({ isGAPageTrackingEnabled: false });
    };
  }, []);
}
