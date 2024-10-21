import EventEmitter from "events";

export default class DisposableEmitter extends EventEmitter {
  private disposeFunctions: (() => void)[] = [];
  private _isDisposed = false;

  // TODO: Rename to `registerDisposeFunction`
  registerDispose(disposeFunction: () => void) {
    this.disposeFunctions.push(disposeFunction);
  }

  dispose() {
    this.disposeFunctions.forEach((fn) => fn());
    this.disposeFunctions = [];
    this.removeAllListeners();

    this._isDisposed = true;
  }

  // TODO: Add methods which wrap setTimeout and setInterval, so they can be disposed with the class

  get isDisposed(): boolean {
    return this._isDisposed;
  }
}
