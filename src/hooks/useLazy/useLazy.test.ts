// useLazy.test.tsx
import { act, renderHook } from "@testing-library/react";

import { vi } from "vitest";

import useLazy from "./useLazy";

describe("useLazy", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useLazy("initial", 50));
    expect(result.current).toBe("initial");
  });

  it("should update the value after the timeout", () => {
    const { result, rerender } = renderHook(({ value }) => useLazy(value, 50), {
      initialProps: { value: "initial" },
    });

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated" });

    // The value should not update immediately
    expect(result.current).toBe("initial");

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // The value should now be updated
    expect(result.current).toBe("updated");
  });

  it("should respect the timeout", () => {
    const { result, rerender } = renderHook(
      ({ value, timeout }) => useLazy(value, timeout),
      {
        initialProps: { value: "initial", timeout: 100 },
      },
    );

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated", timeout: 100 });

    // The value should not update immediately
    expect(result.current).toBe("initial");

    // Fast-forward time less than the timeout
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // The value should still not be updated
    expect(result.current).toBe("initial");

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // The value should now be updated
    expect(result.current).toBe("updated");
  });

  it("should cancel the timeout if the value changes before the timeout", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useLazy(value, 100),
      {
        initialProps: { value: "initial" },
      },
    );

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated1" });

    // Fast-forward time less than the timeout
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // The value should still not be updated
    expect(result.current).toBe("initial");

    // Update the value again before the timeout
    rerender({ value: "updated2" });

    // Fast-forward full timeout time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The value should now be the latest update
    expect(result.current).toBe("updated2");
  });
});
