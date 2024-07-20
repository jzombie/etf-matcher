import fs from "fs";
import path from "path";

// Function to get the current build time and write it to a file
function writeBuildTime() {
  const now = new Date();
  const buildTime = now.toISOString(); // Returns the build time in ISO format
  fs.writeFileSync(
    path.resolve(__dirname, "..", "public", "buildTime.json"),
    JSON.stringify({ buildTime })
  );
  return buildTime;
}

writeBuildTime();
