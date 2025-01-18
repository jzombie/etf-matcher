import { act, renderHook, waitFor } from "@testing-library/react";

import { vi } from "vitest";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

describe("usePromise", () => {
  it("should return initial state correctly", () => {
    const { result } = renderHook(() =>
      usePromise({
        fn: () => Promise.resolve("data"),
        initialAutoExecute: false,
      }),
    );

    expect(result.current.data).toBe(null);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should execute promise and update state on success", async () => {
    const fn = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("should execute promise and update state on error", async () => {
    const fn = vi.fn(() => Promise.reject(new Error("error")));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe(null);
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toEqual(new Error("error"));
    });
  });

  it("should auto-execute promise if initialAutoExecute is true", async () => {
    const fn = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: true,
      }),
    );

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("should call onSuccess callback on success and resolve with the value", async () => {
    const onSuccess = vi.fn();
    const fn = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        onSuccess,
        initialAutoExecute: false,
      }),
    );

    let returnedValue: string | void;

    // Execute the promise and capture the returned value
    await act(async () => {
      returnedValue = await result.current.execute();
    });

    // Ensure onSuccess was called with the correct data
    expect(onSuccess).toHaveBeenCalledWith("data");

    // Ensure the value returned by execute is correct
    // @ts-expect-error For testing only
    expect(returnedValue).toBe("data");

    // Ensure the same value is set as data
    expect(result.current.data).toBe("data");
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should call onError callback on error", async () => {
    const onError = vi.fn();
    const fn = vi.fn(() => Promise.reject(new Error("error")));
    renderHook(() =>
      usePromise({
        fn,
        onError,
        initialAutoExecute: true,
      }),
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error("error"));
    });
  });

  it("should update state correctly when execute is called multiple times before resolution", async () => {
    const consoleWarnSpy = vi.spyOn(customLogger, "warn");

    // Mock promise function that resolves to different values based on input
    const fn = vi.fn(
      (arg) =>
        new Promise((resolve) => setTimeout(() => resolve(`data${arg}`), 100)),
    );

    let callArg = 1;

    const { result } = renderHook(() =>
      usePromise({
        fn: () => fn(callArg), // Initial call with argument 1
        initialAutoExecute: false,
      }),
    );

    act(() => {
      result.current.execute(); // First execution with argument 1

      callArg = 2;
      result.current.execute(); // Second execution with argument 2
    });

    // FIXME: This is currently commented-out due to removing the warning in the hook.
    // This may need to be revisited again in the future.
    //
    // Check that the warning was logged
    // expect(consoleWarnSpy).toHaveBeenCalledWith(
    //   "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
    // );

    // Wait for the promise to resolve and check that the final data is from the second execution
    await waitFor(() => {
      expect(result.current.data).toBe("data2");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Clean up the spy
    consoleWarnSpy.mockRestore();
  });

  it("should execute promise with provided arguments", async () => {
    const fn = vi.fn((arg1: string, arg2: number) =>
      Promise.resolve(`data-${arg1}-${arg2}`),
    );
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    act(() => {
      result.current.execute("test", 42);
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data-test-42");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(fn).toHaveBeenCalledWith("test", 42);
  });

  it("should auto-execute promise with initialAutoExecuteProps if initialAutoExecute is true", async () => {
    const fn = vi.fn((arg1: string, arg2: number) =>
      Promise.resolve(`data-${arg1}-${arg2}`),
    );
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: true,
        initialAutoExecuteProps: ["auto", 99],
      }),
    );

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data-auto-99");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(fn).toHaveBeenCalledWith("auto", 99);
  });

  it("should not auto-execute if initialAutoExecute is false, even with initialAutoExecuteProps", () => {
    const fn = vi.fn();
    renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
        initialAutoExecuteProps: ["auto", 99],
      }),
    );

    expect(fn).not.toHaveBeenCalled();
  });

  it("should reset state correctly", async () => {
    const fn = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    // Execute the promise
    act(() => {
      result.current.execute();
    });

    // Wait for the promise to resolve
    await waitFor(() => {
      expect(result.current.data).toBe("data");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Call reset
    act(() => {
      result.current.reset();
    });

    // Check that the state has been reset
    expect(result.current.data).toBe(null);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should clear data when an error occurs", async () => {
    const fn = vi.fn(() => Promise.reject(new Error("test error")));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    // Execute the promise
    act(() => {
      result.current.execute();
    });

    // Expect isPending to be true while executing
    expect(result.current.isPending).toBe(true);

    // Wait for the promise to reject
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toEqual(new Error("test error"));
      expect(result.current.data).toBe(null); // Check that data is cleared on error
    });
  });

  it("should return the value from execute while also setting it as data", async () => {
    const fn = vi.fn(() => Promise.resolve("direct-value"));
    const { result } = renderHook(() =>
      usePromise({
        fn,
        initialAutoExecute: false,
      }),
    );

    let returnedValue: string | void;

    // Execute the promise and capture the returned value
    await act(async () => {
      returnedValue = await result.current.execute();
    });

    // Ensure the value returned by execute is correct
    // @ts-expect-error For testing purposes only
    expect(returnedValue).toBe("direct-value");

    // Ensure the same value is set as data
    expect(result.current.data).toBe("direct-value");
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
