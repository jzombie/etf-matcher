import { useEffect } from "react";

const GOOGLE_ANALYTICS_ID = (window as unknown as { [key: string]: string })
  .GOOGLE_ANALYTICS_ID;

// Note: This intentionally does not use `react-router` events so that it
// doesn't have to be a child of a `react-router` context.
export default function useGAPageTracking() {
  useEffect(() => {
    if (!GOOGLE_ANALYTICS_ID) {
      console.warn(
        "`GOOGLE_ANALYTICS_ID` was not recovered from window. Skipping GA page tracking."
      );

      return;
    }

    // TODO: Incorporate page title

    // Function to send page view to Google Analytics
    const sendPageView = () => {
      console.log({
        page_path:
          window.location.pathname +
          window.location.search +
          window.location.hash,
        page_title: window.document.title,
        page_location: window.location.href,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gtag = (window as { [key: string]: any }).gtag;
      if (typeof gtag === "function") {
        gtag("event", "page_view", {
          page_path:
            window.location.pathname +
            window.location.search +
            window.location.hash,
          page_title: window.document.title,
          page_location: window.location.href,
        });
      } else {
        console.warn("`gtag` is not a function. Skipping GA page tracking.");
      }
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

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);
}
