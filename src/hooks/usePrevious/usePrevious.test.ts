import { renderHook } from "@testing-library/react";
import usePrevious from "./usePrevious";

describe("usePrevious hook", () => {
  it("should return undefined initially", () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it("should return the previous value after update", () => {
    const { result, rerender } = renderHook((value) => usePrevious(value), {
      initialProps: 1,
    });
    // Initial render
    expect(result.current).toBeUndefined();

    // Update the value
    rerender(2);
    expect(result.current).toBe(1);

    // Update the value again
    rerender(3);
    expect(result.current).toBe(2);
  });
});
