import { buildTime } from "../../public/buildTime.json";
import customLogger from "./customLogger";

// Simple utility to determine if HTML and JS are on the same version
export default function detectHTMLJSVersionSync(): boolean {
  const jsBuildTime = buildTime;
  const htmlBuildTime = window.document
    .querySelector('meta[name="html_build_time"]')
    ?.getAttribute("content");

  if (jsBuildTime === htmlBuildTime) {
    customLogger.debug("HTML and JS versions are in sync");

    return true;
  } else {
    if (import.meta.env.PROD) {
      customLogger.warn("HTML and JS versions are not in sync!", {
        jsBuildTime,
        htmlBuildTime,
      });
    }

    return false;
  }
}
