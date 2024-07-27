import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import debounceWithKey from "./debounceWithKey";

describe("debounceWithKey", () => {
  let mockFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFunction = vi.fn();
    vi.useFakeTimers(); // Use fake timers to control time in tests
  });

  afterEach(() => {
    vi.useRealTimers(); // Reset to real timers after each test
  });

  it("should debounce a function call (default auto-invoke)", () => {
    debounceWithKey("test", mockFunction, 300, true, 1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should debounce a function call (manual invocation)", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300, false);

    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple keys independently", async () => {
    const mockFunction2 = vi.fn();
    const debouncedFunction1 = debounceWithKey(
      "key1",
      mockFunction,
      300,
      false,
    );
    const debouncedFunction2 = debounceWithKey(
      "key2",
      mockFunction2,
      300,
      false,
    );

    debouncedFunction1();
    debouncedFunction2();
    debouncedFunction1();
    debouncedFunction2();

    expect(mockFunction).not.toHaveBeenCalled();
    expect(mockFunction2).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction2).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls with the same key", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300, false);

    debouncedFunction();
    vi.advanceTimersByTime(100);
    debouncedFunction();
    vi.advanceTimersByTime(100);
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should call the debounced function after the specified delay", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 500, false);

    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should preserve the context when calling the debounced function", async () => {
    const context = { value: 42 };
    function func(this: typeof context) {
      mockFunction(this.value);
    }

    const debouncedFunction = debounceWithKey(
      "test",
      func.bind(context),
      300,
      false,
    );

    debouncedFunction();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(42);
  });

  it("should pass the correct arguments to the debounced function", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300, false);

    debouncedFunction(1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(1, 2, 3);
  });

  it("should clear the debounced function", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300, false);

    debouncedFunction();
    debouncedFunction.clear();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).not.toHaveBeenCalled();
  });

  it("should auto-invoke the debounced function with arguments", () => {
    debounceWithKey("test", mockFunction, 300, true, 1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle manual invocation after auto-invoke", async () => {
    const debouncedFunction = debounceWithKey(
      "test",
      mockFunction,
      300,
      true,
      1,
      2,
      3,
    );

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFunction).toHaveBeenCalledTimes(1);

    debouncedFunction(4, 5, 6);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFunction).toHaveBeenCalledWith(4, 5, 6);
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });
});
