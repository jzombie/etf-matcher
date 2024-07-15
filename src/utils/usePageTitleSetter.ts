import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_PAGE_TITLE = window.document.title;

export default function usePageTitleSetter(nextPageTitle?: string | null) {
  const location = useLocation();

  useEffect(() => {
    // Determine the new page title
    const newPageTitle = nextPageTitle
      ? `${nextPageTitle} | ${DEFAULT_PAGE_TITLE}`
      : DEFAULT_PAGE_TITLE;

    console.log({ location, nextPageTitle, newPageTitle });

    // Set the new page title
    window.document.title = newPageTitle;
  }, [nextPageTitle, location]);
}
