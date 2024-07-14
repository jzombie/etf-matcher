import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import debounceWithKey from "./debounceWithKey";

// A helper function to wait for a specified duration
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("debounceWithKey", () => {
  let mockFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should debounce a function call", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300);

    debouncedFunction();
    debouncedFunction();
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    await wait(300);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple keys independently", async () => {
    const mockFunction2 = vi.fn();
    const debouncedFunction1 = debounceWithKey("key1", mockFunction, 300);
    const debouncedFunction2 = debounceWithKey("key2", mockFunction2, 300);

    debouncedFunction1();
    debouncedFunction2();
    debouncedFunction1();
    debouncedFunction2();

    expect(mockFunction).not.toHaveBeenCalled();
    expect(mockFunction2).not.toHaveBeenCalled();

    await wait(300);

    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction2).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls with the same key", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300);

    debouncedFunction();
    await wait(100);
    debouncedFunction();
    await wait(100);
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    await wait(300);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should call the debounced function after the specified delay", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 500);

    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    await wait(500);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("should preserve the context when calling the debounced function", async () => {
    const context = { value: 42 };
    function func(this: typeof context) {
      mockFunction(this.value);
    }

    const debouncedFunction = debounceWithKey("test", func.bind(context), 300);

    debouncedFunction();

    await wait(300);

    expect(mockFunction).toHaveBeenCalledWith(42);
  });

  it("should pass the correct arguments to the debounced function", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300);

    debouncedFunction(1, 2, 3);

    await wait(300);

    expect(mockFunction).toHaveBeenCalledWith(1, 2, 3);
  });

  it("should clear the debounced function", async () => {
    const debouncedFunction = debounceWithKey("test", mockFunction, 300);

    debouncedFunction();
    debouncedFunction.clear();

    await wait(300);

    expect(mockFunction).not.toHaveBeenCalled();
  });
});
