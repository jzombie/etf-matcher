import getEnvVariable from "@utils/getEnvVariable";

/**
 * Custom console logging that retains the original stack trace.
 *
 * Problem:
 * When using custom logging functions or wrappers around console methods,
 * the line number and file information in the stack trace often point to the
 * location of the custom logger implementation, rather than the original call
 * site. This makes it difficult to trace where the log was actually invoked.
 *
 * Solution:
 * This custom logger binds the original console methods to the console object,
 * ensuring that the stack trace retains the original call site information.
 * By dynamically creating logger methods for all console functions, it avoids
 * the need to hardcode method names and ensures that any future console methods
 * are also included.
 */

const PROD_WHITELIST: (keyof Console)[] = ["warn", "error"] as const;

/**
 * Creates a logger method that retains the original stack trace.
 *
 * @param method - The console method to wrap (e.g., 'log', 'warn', 'error').
 * @returns A function that calls the original console method with the correct context.
 */
function _createLoggerMethod(method: keyof Console) {
  // Don't log in production
  if (getEnvVariable<boolean>("PROD") && !PROD_WHITELIST.includes(method)) {
    return () => null;
  }

  if (Function.prototype.bind) {
    return Function.prototype.bind.call(globalThis.console[method], console);
  } else {
    return function (...args: unknown[]) {
      Function.prototype.apply.call(globalThis.console[method], console, args);
    };
  }
}

export type CustomLogger = {
  [K in keyof Console]: (...args: unknown[]) => void;
};

export function createCustomLogger(): CustomLogger {
  const ret = {} as CustomLogger;

  Object.keys(console).forEach((prop) => {
    if (typeof globalThis.console[prop as keyof Console] === "function") {
      ret[prop as keyof Console] = _createLoggerMethod(prop as keyof Console);
    }
  });

  return ret;
}

// Note: This should be adaptable so that the loglevel can be configured during
// runtime without breaking the stack traces.
const customLogger = createCustomLogger();

export default customLogger;
