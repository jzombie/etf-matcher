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

/**
 * Creates a logger method that retains the original stack trace.
 *
 * @param method - The console method to wrap (e.g., 'log', 'warn', 'error').
 * @returns A function that calls the original console method with the correct context.
 */
const createLoggerMethod = (method: keyof Console) => {
  // Don't log in production
  if (import.meta.env.PROD) {
    return () => null;
  }

  if (Function.prototype.bind) {
    return Function.prototype.bind.call(console[method], console);
  } else {
    return function (...args: any[]) {
      Function.prototype.apply.call(console[method], console, args);
    };
  }
};

const customLogger: { [key in keyof Console]?: any } = {};

Object.keys(console).forEach((prop) => {
  if (typeof console[prop as keyof Console] === "function") {
    customLogger[prop as keyof Console] = createLoggerMethod(
      prop as keyof Console
    );
  }
});

export default customLogger;
