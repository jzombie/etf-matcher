import React, { useEffect } from "react";
import { To, useLocation, useNavigate } from "react-router-dom";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function NotFound() {
  usePageTitleSetter("Not Found");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const attemptMatch = async (path: To) => {
      // Attempt to navigate to the path to see if it matches a route
      try {
        await navigate(path);
        return true; // If navigation was successful, return true
      } catch (error) {
        return false; // If navigation failed, return false
      }
    };

    const walkBackPath = async () => {
      const segments = location.pathname.split("/");
      // Start with the current path and progressively shorten it
      for (let i = segments.length - 1; i > 0; i--) {
        const path = segments.slice(0, i).join("/") || "/";
        const matched = await attemptMatch(path);
        if (matched) return;
      }
      // If no match found, navigate to a default fallback (like home page or 404)
      navigate("/");
    };

    walkBackPath();
  }, [location, navigate]);

  return <div>Redirecting...</div>;
}
