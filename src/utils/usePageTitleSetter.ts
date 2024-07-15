import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import debounceWithKey from "./debounceWithKey";

const DEFAULT_PAGE_TITLE = window.document.title;

export default function usePageTitleSetter(nextPageTitle?: string | null) {
  const location = useLocation();

  useEffect(() => {
    // Use debounce to prevent potential race conditions when changing routes.
    debounceWithKey(
      "page_title_setter",
      () => {
        // Determine the new page title
        const newPageTitle = nextPageTitle
          ? `${nextPageTitle} | ${DEFAULT_PAGE_TITLE}`
          : DEFAULT_PAGE_TITLE;

        console.debug("Setting new page title: ", newPageTitle);

        // Set the new page title
        window.document.title = newPageTitle;
      },
      5
    );
  }, [nextPageTitle, location]);
}
