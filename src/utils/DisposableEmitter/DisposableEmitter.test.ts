import { describe, expect, it, vi } from "vitest";

import DisposableEmitter from "./DisposableEmitter";

describe("DisposableEmitter", () => {
  it("should register and call dispose functions on dispose", () => {
    const emitter = new DisposableEmitter();

    const disposeFn1 = vi.fn();
    const disposeFn2 = vi.fn();

    emitter.registerDispose(disposeFn1);
    emitter.registerDispose(disposeFn2);

    emitter.dispose();

    expect(disposeFn1).toHaveBeenCalledTimes(1);
    expect(disposeFn2).toHaveBeenCalledTimes(1);
  });

  it("should call registered dispose functions in order", () => {
    const emitter = new DisposableEmitter();

    const callOrder: string[] = [];
    const disposeFn1 = vi.fn(() => callOrder.push("disposeFn1"));
    const disposeFn2 = vi.fn(() => callOrder.push("disposeFn2"));

    emitter.registerDispose(disposeFn1);
    emitter.registerDispose(disposeFn2);

    emitter.dispose();

    expect(callOrder).toEqual(["disposeFn1", "disposeFn2"]);
  });

  it("should remove all event listeners on dispose", () => {
    const emitter = new DisposableEmitter();

    const listener = vi.fn();
    emitter.on("testEvent", listener);

    emitter.emit("testEvent");
    expect(listener).toHaveBeenCalledTimes(1);

    emitter.dispose();
    emitter.emit("testEvent");
    expect(listener).toHaveBeenCalledTimes(1); // No additional calls after dispose
  });

  it("should correctly identify when it is disposed", () => {
    const emitter = new DisposableEmitter();

    // Initially, it should not be disposed
    expect(emitter.isDisposed).toBe(false);

    // Dispose the emitter
    emitter.dispose();

    // After disposing, it should be marked as disposed
    expect(emitter.isDisposed).toBe(true);
  });
});
