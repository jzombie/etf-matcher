import { describe, expect, it, vi } from "vitest";

import customLogger from "@utils/customLogger";

import DisposableEmitter from "./DisposableEmitter";

describe("DisposableEmitter", () => {
  it("should register and call dispose functions on dispose", () => {
    const emitter = new DisposableEmitter();

    const disposeFn1 = vi.fn();
    const disposeFn2 = vi.fn();

    emitter.registerDisposeFunction(disposeFn1);
    emitter.registerDisposeFunction(disposeFn2);

    emitter.dispose();

    expect(disposeFn1).toHaveBeenCalledTimes(1);
    expect(disposeFn2).toHaveBeenCalledTimes(1);
  });

  it("should call registered dispose functions in order", () => {
    const emitter = new DisposableEmitter();

    const callOrder: string[] = [];
    const disposeFn1 = vi.fn(() => callOrder.push("disposeFn1"));
    const disposeFn2 = vi.fn(() => callOrder.push("disposeFn2"));

    emitter.registerDisposeFunction(disposeFn1);
    emitter.registerDisposeFunction(disposeFn2);

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

  it("should clear timeouts on dispose", () => {
    const emitter = new DisposableEmitter();

    const timeoutCallback = vi.fn();
    emitter.setTimeout(timeoutCallback, 100);

    emitter.dispose();

    // Ensure timeout callback is not called after dispose
    setTimeout(() => {
      expect(timeoutCallback).not.toHaveBeenCalled();
    }, 200);
  });

  it("should clear intervals on dispose", () => {
    const emitter = new DisposableEmitter();

    const intervalCallback = vi.fn();
    emitter.setInterval(intervalCallback, 100);

    emitter.dispose();

    // Ensure interval callback is not called after dispose
    setTimeout(() => {
      expect(intervalCallback).not.toHaveBeenCalled();
    }, 200);
  });

  it("should clear a registered timeout", () => {
    const emitter = new DisposableEmitter();

    const timeoutCallback = vi.fn();
    const timeout = emitter.setTimeout(timeoutCallback, 100);

    emitter.clearTimeout(timeout);

    // Ensure timeout callback is not called after clearTimeout
    setTimeout(() => {
      expect(timeoutCallback).not.toHaveBeenCalled();
    }, 200);
  });

  it("should clear a registered interval", () => {
    const emitter = new DisposableEmitter();

    const intervalCallback = vi.fn();
    const interval = emitter.setInterval(intervalCallback, 100);

    emitter.clearInterval(interval);

    // Ensure interval callback is not called after clearInterval
    setTimeout(() => {
      expect(intervalCallback).not.toHaveBeenCalled();
    }, 200);
  });

  it("should warn when clearing a non-existent timeout", () => {
    const emitter = new DisposableEmitter();
    const consoleWarnSpy = vi
      .spyOn(customLogger, "warn")
      .mockImplementation(() => {});

    const fakeTimeout = setTimeout(() => {}, 100);
    emitter.clearTimeout(fakeTimeout);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Attempted to clear a non-existent timeout.",
    );
    consoleWarnSpy.mockRestore();
  });

  it("should warn when clearing a non-existent interval", () => {
    const emitter = new DisposableEmitter();
    const consoleWarnSpy = vi
      .spyOn(customLogger, "warn")
      .mockImplementation(() => {});

    const fakeInterval = setInterval(() => {}, 100);
    emitter.clearInterval(fakeInterval);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Attempted to clear a non-existent interval.",
    );
    consoleWarnSpy.mockRestore();
  });

  it("should allow unregistering a dispose function", () => {
    const emitter = new DisposableEmitter();

    const disposeFn = vi.fn();
    const unregister = emitter.registerDisposeFunction(disposeFn);

    // Unregister the dispose function
    unregister();

    emitter.dispose();

    // Ensure the dispose function is not called after being unregistered
    expect(disposeFn).not.toHaveBeenCalled();
  });
});
