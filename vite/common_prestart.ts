import fs from "fs";
import path from "path";

// Function to get the current build time and write it to a file
const writeBuildTime = () => {
  let _cachedBuildTime: string | void;

  function writeBuildTime() {
    if (_cachedBuildTime) {
      return _cachedBuildTime;
    }

    const now = new Date();
    const buildTime = now.toISOString(); // Returns the build time in ISO format
    fs.writeFileSync(
      path.resolve(__dirname, "..", "public", "buildTime.json"),
      JSON.stringify({ buildTime })
    );

    _cachedBuildTime = buildTime;

    return buildTime;
  }

  return writeBuildTime;
};

export { writeBuildTime };

// Auto-invoke
writeBuildTime();
