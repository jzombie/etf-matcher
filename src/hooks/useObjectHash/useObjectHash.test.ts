import { renderHook, waitFor } from "@testing-library/react";
import useObjectHash from "./useObjectHash";

describe("useObjectHash", () => {
  it("generates a unique hash for a single object", async () => {
    const { result, rerender } = renderHook(({ obj }) => useObjectHash(obj), {
      initialProps: { obj: { key: "value" } },
    });

    await waitFor(() => expect(result.current).toBeTruthy());
    const hash1 = result.current;

    // Re-run with a different object
    rerender({ obj: { key: "value2" } });
    await waitFor(() => expect(result.current).not.toEqual(hash1));
  });

  it("generates a unique hash for an array of objects", async () => {
    const { result, rerender } = renderHook(({ obj }) => useObjectHash(obj), {
      initialProps: { obj: [{ key1: "value1" }, { key2: "value2" }] },
    });

    await waitFor(() => expect(result.current).toBeTruthy());
    const hashArray = result.current;

    // Re-run with a different array
    rerender({ obj: [{ key1: "value1" }, { key2: "value3" }] });
    await waitFor(() => expect(result.current).not.toEqual(hashArray));
  });

  it("handles nested objects correctly", async () => {
    const { result, rerender } = renderHook(({ obj }) => useObjectHash(obj), {
      initialProps: {
        obj: {
          level1: {
            level2: { level3: "deep value" },
          },
        },
      },
    });

    await waitFor(() => expect(result.current).toBeTruthy());
    const nestedHash = result.current;

    // Re-run with a similar but different nested structure
    rerender({
      obj: {
        level1: {
          level2: { level3: "another value" },
        },
      },
    });
    await waitFor(() => expect(result.current).not.toEqual(nestedHash));
  });

  it("generates an empty string if no object or array is given", async () => {
    const { result } = renderHook(() => useObjectHash());

    await waitFor(() => expect(result.current).toBe("")); // Empty string check
  });

  it("produces consistent hashes for identical objects", async () => {
    const testObject = { key: "consistent" };

    const { result, rerender } = renderHook(({ obj }) => useObjectHash(obj), {
      initialProps: { obj: testObject },
    });

    await waitFor(() => expect(result.current).toBeTruthy());
    const firstHash = result.current;

    // Re-render with the same object
    rerender({ obj: testObject });
    await waitFor(() => expect(result.current).toEqual(firstHash));
  });
});
