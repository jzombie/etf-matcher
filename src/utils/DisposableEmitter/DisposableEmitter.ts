import EventEmitter from "events";

import customLogger from "@utils/customLogger";

export default class DisposableEmitter extends EventEmitter {
  private disposeFunctions: (() => void)[] = [];
  private _isDisposed = false;
  private _timeouts: NodeJS.Timeout[] = [];
  private _intervals: NodeJS.Timeout[] = [];

  // TODO: Rename to `registerDisposeFunction`
  registerDispose(disposeFunction: () => void) {
    this.disposeFunctions.push(disposeFunction);
  }

  setTimeout(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const timeout = setTimeout(callback, ms, ...args);
    this._timeouts.push(timeout);
    return timeout;
  }

  setInterval(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const interval = setInterval(callback, ms, ...args);
    this._intervals.push(interval);
    return interval;
  }

  clearTimeout(timeout: NodeJS.Timeout) {
    if (!this._timeouts.includes(timeout)) {
      customLogger.warn("Attempted to clear a non-existent timeout.");
    } else {
      clearTimeout(timeout);
      this._timeouts = this._timeouts.filter((t) => t !== timeout);
    }
  }

  clearInterval(interval: NodeJS.Timeout) {
    if (!this._intervals.includes(interval)) {
      customLogger.warn("Attempted to clear a non-existent interval.");
    } else {
      clearInterval(interval);
      this._intervals = this._intervals.filter((i) => i !== interval);
    }
  }

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

  get isDisposed(): boolean {
    return this._isDisposed;
  }
}
