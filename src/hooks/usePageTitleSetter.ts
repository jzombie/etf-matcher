import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import setPageTitle from "@utils/setPageTitle";

export default function usePageTitleSetter(nextPageTitle?: string | null) {
  const location = useLocation();

  useEffect(() => {
    setPageTitle(nextPageTitle);
  }, [nextPageTitle, location]);
}
