import EventEmitter from "events";

import customLogger from "@utils/customLogger";

export default class DisposableEmitter extends EventEmitter {
  private disposeFunctions: (() => void)[] = [];
  private _isDisposed = false;
  private _timeouts: NodeJS.Timeout[] = [];
  private _intervals: NodeJS.Timeout[] = [];

  /**
   * Registers a dispose function to be called when the emitter is disposed.
   * Returns a function that can be called to unregister the dispose function.
   */
  registerDisposeFunction(disposeFunction: () => void): () => void {
    this.disposeFunctions.push(disposeFunction);

    // Return a function to unregister the dispose function
    return () => {
      this.disposeFunctions = this.disposeFunctions.filter(
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
    if (!this._timeouts.includes(timeout)) {
      customLogger.warn("Attempted to clear a non-existent timeout.");
    } else {
      clearTimeout(timeout);
      this._timeouts = this._timeouts.filter((t) => t !== timeout);
    }
  }

  /**
   * Clears a registered interval. Logs a warning if the interval does not exist.
   */
  clearInterval(interval: NodeJS.Timeout) {
    if (!this._intervals.includes(interval)) {
      customLogger.warn("Attempted to clear a non-existent interval.");
    } else {
      clearInterval(interval);
      this._intervals = this._intervals.filter((i) => i !== interval);
    }
  }

  /**
   * Disposes the emitter by calling all registered dispose functions,
   * removing all event listeners, and clearing all timeouts and intervals.
   */
  dispose() {
    this.disposeFunctions.forEach((fn) => fn());
    this.disposeFunctions = [];
    this.removeAllListeners();

    // Clear all timeouts and intervals
    this._timeouts.forEach((timeout) => this.clearTimeout(timeout));
    this._intervals.forEach((interval) => this.clearInterval(interval));
    this._timeouts = [];
    this._intervals = [];

    this._isDisposed = true;
  }

  /**
   * Indicates whether the emitter has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }
}
