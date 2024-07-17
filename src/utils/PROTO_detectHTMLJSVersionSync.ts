import { buildTime } from "../../public/buildTime.json";

export default function detectHTMLJSVersionSync(): boolean {
  const jsBuildTime = buildTime;
  const htmlBuildTime = window.document
    .querySelector('meta[name="html_build_time"]')
    ?.getAttribute("content");

  if (jsBuildTime === htmlBuildTime) {
    console.debug("HTML and JS versions are in sync");

    return true;
  } else {
    console.warn("HTML and JS versions are not in sync!", {
      jsBuildTime,
      htmlBuildTime,
    });

    return false;
  }
}
