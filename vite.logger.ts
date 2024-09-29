import os from "node:os";
import { createLogger } from "vite";

const logger = createLogger();
const loggerErr = logger.error;

// Custom logger to suppress false error messages from vite-plugin-checker.
// This resolves an issue where ESLint and TypeScript checks with zero errors
// or warnings were incorrectly logged as errors, as described in
// https://github.com/fi3ework/vite-plugin-checker/issues/238.
// The logger converts these messages into informational logs to avoid
// confusion during development.
// Related ticket: https://linear.app/zenosmosis/issue/ZEN-70/incorrect-vite-error-messages
logger.error = (msg, options) => {
  if (msg.match(/.*\[ESLint\] Found 0 error and 0 warning.*/)) {
    logger.info(msg, options);
    return;
  }

  if (
    msg.match(/.*\[TypeScript\] Found 0 errors. Watching for file changes.*/)
  ) {
    logger.info(msg.replace(os.EOL, ""), options);
    return;
  }

  loggerErr(msg, options);
};
export default logger;
