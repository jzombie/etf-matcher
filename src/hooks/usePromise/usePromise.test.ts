import { act, renderHook, waitFor } from "@testing-library/react";

import { vi } from "vitest";

import customLogger from "@utils/customLogger";

import usePromise from "./usePromise";

describe("usePromise", () => {
  it("should return initial state correctly", () => {
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction: () => Promise.resolve("data"),
        autoExecute: false,
      }),
    );

    expect(result.current.data).toBe(null);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should execute promise and update state on success", async () => {
    const promiseFunction = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: false,
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
    const promiseFunction = vi.fn(() => Promise.reject(new Error("error")));
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: false,
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

  it("should auto-execute promise if autoExecute is true", async () => {
    const promiseFunction = vi.fn(() => Promise.resolve("data"));
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: true,
      }),
    );

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("should call onLoad callback on success", async () => {
    const onLoad = vi.fn();
    const promiseFunction = vi.fn(() => Promise.resolve("data"));
    renderHook(() =>
      usePromise({
        promiseFunction,
        onLoad,
        autoExecute: true,
      }),
    );

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith("data");
    });
  });

  it("should call onError callback on error", async () => {
    const onError = vi.fn();
    const promiseFunction = vi.fn(() => Promise.reject(new Error("error")));
    renderHook(() =>
      usePromise({
        promiseFunction,
        onError,
        autoExecute: true,
      }),
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error("error"));
    });
  });

  it("should warn and update state correctly when execute is called multiple times before resolution", async () => {
    const consoleWarnSpy = vi.spyOn(customLogger, "warn");

    // Mock promise function that resolves to different values based on input
    const promiseFunction = vi.fn(
      (arg) =>
        new Promise((resolve) => setTimeout(() => resolve(`data${arg}`), 100)),
    );

    let callArg = 1;

    const { result } = renderHook(() =>
      usePromise({
        promiseFunction: () => promiseFunction(callArg), // Initial call with argument 1
        autoExecute: false,
      }),
    );

    act(() => {
      result.current.execute(); // First execution with argument 1

      callArg = 2;
      result.current.execute(); // Second execution with argument 2
    });

    // Check that the warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
    );

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
    const promiseFunction = vi.fn((arg1: string, arg2: number) =>
      Promise.resolve(`data-${arg1}-${arg2}`),
    );
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: false,
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

    expect(promiseFunction).toHaveBeenCalledWith("test", 42);
  });

  it("should auto-execute promise with autoExecuteProps if autoExecute is true", async () => {
    const promiseFunction = vi.fn((arg1: string, arg2: number) =>
      Promise.resolve(`data-${arg1}-${arg2}`),
    );
    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: true,
        autoExecuteProps: ["auto", 99],
      }),
    );

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toBe("data-auto-99");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(promiseFunction).toHaveBeenCalledWith("auto", 99);
  });

  it("should not auto-execute if autoExecute is false, even with autoExecuteProps", () => {
    const promiseFunction = vi.fn();
    renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: false,
        autoExecuteProps: ["auto", 99],
      }),
    );

    expect(promiseFunction).not.toHaveBeenCalled();
  });
});
