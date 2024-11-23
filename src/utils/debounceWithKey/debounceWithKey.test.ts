import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import debounceWithKey from "./debounceWithKey";

describe("debounceWithKey", () => {
  let mockFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFn = vi.fn();
    vi.useFakeTimers(); // Use fake timers to control time in tests
  });

  afterEach(() => {
    vi.useRealTimers(); // Reset to real timers after each test
  });

  it("should debounce a function call (default auto-invoke)", () => {
    debounceWithKey("test", mockFn, 300, true, 1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should debounce a function call (manual invocation)", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 300, false);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple keys independently", async () => {
    const mockFn2 = vi.fn();
    const debouncedFn1 = debounceWithKey("key1", mockFn, 300, false);
    const debouncedFn2 = debounceWithKey("key2", mockFn2, 300, false);

    debouncedFn1();
    debouncedFn2();
    debouncedFn1();
    debouncedFn2();

    expect(mockFn).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls with the same key", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 300, false);

    debouncedFn();
    vi.advanceTimersByTime(100);
    debouncedFn();
    vi.advanceTimersByTime(100);
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should call the debounced function after the specified delay", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 500, false);

    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should preserve the context when calling the debounced function", async () => {
    const context = { value: 42 };
    function func(this: typeof context) {
      mockFn(this.value);
    }

    const debouncedFn = debounceWithKey("test", func.bind(context), 300, false);

    debouncedFn();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(42);
  });

  it("should pass the correct arguments to the debounced function", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 300, false);

    debouncedFn(1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
  });

  it("should clear the debounced function", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 300, false);

    debouncedFn();
    debouncedFn.clear();

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).not.toHaveBeenCalled();
  });

  it("should auto-invoke the debounced function with arguments", () => {
    debounceWithKey("test", mockFn, 300, true, 1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle manual invocation after auto-invoke", async () => {
    const debouncedFn = debounceWithKey("test", mockFn, 300, true, 1, 2, 3);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn(4, 5, 6);

    vi.runAllTimers(); // Advance timers to ensure debounced function is called

    expect(mockFn).toHaveBeenCalledWith(4, 5, 6);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
