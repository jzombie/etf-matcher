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
    const promiseFunction = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve("data"), 100)),
    );

    const { result } = renderHook(() =>
      usePromise({
        promiseFunction,
        autoExecute: false,
      }),
    );

    act(() => {
      result.current.execute();
      result.current.execute(); // Call execute again before the first promise resolves
    });

    // Check that the warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "A new promise is being invoked while another is still pending. This might lead to unexpected behavior.",
    );

    // Wait for the promise to resolve
    await waitFor(() => {
      expect(result.current.data).toBe("data");
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Clean up the spy
    consoleWarnSpy.mockRestore();
  });
});
