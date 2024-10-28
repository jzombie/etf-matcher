import EventEmitter from "events";

import customLogger from "@utils/customLogger";

/**
 * DisposableEmitter is an extension of the Node.js EventEmitter class.
 * It provides additional functionality to manage and dispose of timeouts and intervals
 * associated with the emitter, ensuring that resources are properly cleaned up.
 *
 * This class is useful in scenarios where you have multiple asynchronous operations
 * (such as timeouts and intervals) tied to an event emitter, and you want to ensure
 * they are cleared when no longer needed, preventing potential memory leaks.
 */
export default class DisposableEmitter extends EventEmitter {
  private _disposeFunctions: (() => void)[] = [];
  private _isDisposed = false;
  private _timeouts: NodeJS.Timeout[] = [];
  private _intervals: NodeJS.Timeout[] = [];

  /**
   * Registers a dispose function to be called when the emitter is disposed.
   * Returns a function that can be called to unregister the dispose function.
   */
  registerDisposeFunction(disposeFunction: () => void): () => void {
    this._disposeFunctions.push(disposeFunction);

    // Return a function to unregister the dispose function
    return () => {
      this._disposeFunctions = this._disposeFunctions.filter(
        (fn) => fn !== disposeFunction,
      );
    };
  }

  /**
   * Sets a timeout and registers it for automatic clearing upon disposal.
   */
  setTimeout(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const timeout = setTimeout(callback, ms, ...args);
    this._timeouts.push(timeout);
    return timeout;
  }

  /**
   * Sets an interval and registers it for automatic clearing upon disposal.
   */
  setInterval(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const interval = setInterval(callback, ms, ...args);
    this._intervals.push(interval);
    return interval;
  }

  /**
   * Clears a registered timeout. Logs a warning if the timeout does not exist.
   */
  clearTimeout(timeout: NodeJS.Timeout) {
    this._timeouts = this._clearTimer(
      timeout,
      this._timeouts,
      clearTimeout,
      "timeout",
    );
  }

  /**
   * Clears a registered interval. Logs a warning if the interval does not exist.
   */
  clearInterval(interval: NodeJS.Timeout) {
    this._intervals = this._clearTimer(
      interval,
      this._intervals,
      clearInterval,
      "interval",
    );
  }

  /**
   * Clears a registered timeout or interval. Logs a warning if it does not exist.
   */
  private _clearTimer(
    timer: NodeJS.Timeout,
    timers: NodeJS.Timeout[],
    clearFn: (timer: NodeJS.Timeout) => void,
    timerType: string,
  ) {
    if (!timers.includes(timer)) {
      customLogger.warn(`Attempted to clear a non-existent ${timerType}.`);
    } else {
      clearFn(timer);
      return timers.filter((t) => t !== timer);
    }
    return timers;
  }

  /**
   * Disposes the emitter by calling all registered dispose functions,
   * removing all event listeners, and clearing all timeouts and intervals.
   */
  dispose() {
    return this._doDispose();
  }

  private _doDispose() {
    if (this._isDisposed) {
      return;
    }

    this._disposeFunctions.forEach((fn) => fn());
    this._disposeFunctions = [];
    this.removeAllListeners();

    // Clear all timeouts and intervals
    //
    // Note: The `slice()` method is used to create a shallow copy of the arrays.
    // This is important because `clearTimeout` and `clearInterval` might modify
    // the `_timeouts` and `_intervals` arrays (e.g., by removing elements).
    // By iterating over a copy, we avoid potential issues that could arise
    // from modifying the arrays while iterating over them.
    this._timeouts.slice().forEach((timeout) => this.clearTimeout(timeout));
    this._intervals.slice().forEach((interval) => this.clearInterval(interval));
    this._timeouts = [];
    this._intervals = [];

    // Prevent methods from being called after disposal
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const property = this[key as keyof this];
      if (typeof property === "function" && key !== "constructor") {
        (this[key as keyof this] as unknown) = this._createNullifiedMethod(key);
      }
    }

    this._isDisposed = true;
  }

  /**
   * Indicates whether the emitter has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Creates a nullified method that logs a warning with the method name.
   */
  private _createNullifiedMethod(methodName: string) {
    return () => {
      customLogger.warn(
        `The method "${methodName}" cannot be called on a disposed emitter.`,
      );
    };
  }
}
