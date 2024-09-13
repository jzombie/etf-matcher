import { buildTime } from "../../public/buildTime.json";
import customLogger from "./customLogger";

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
