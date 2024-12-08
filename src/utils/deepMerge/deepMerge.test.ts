import { describe, expect, it } from "vitest";

import deepMerge from "./deepMerge";

describe("deepMerge", () => {
  it("merges flat objects correctly", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(target).toEqual({ a: 1, b: 3, c: 4 }); // Confirm in-place modification
  });

  it("merges nested objects", () => {
    const target = {
      a: 1,
      b: {
        c: 2,
      },
    };
    const source = {
      b: {
        d: 3,
      },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    });
  });

  it("overwrites non-object properties", () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: 3 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3 });
  });

  it("handles arrays by overwriting", () => {
    const target = { a: [1, 2, 3] };
    const source = { a: [4, 5] };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: [4, 5] });
  });

  it("merges deeply nested objects", () => {
    const target = {
      a: {
        b: {
          c: {
            d: 1,
          },
        },
      },
    };
    const source = {
      a: {
        b: {
          c: {
            e: 2,
          },
        },
      },
      hello: "there",
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: {
        b: {
          c: {
            d: 1,
            e: 2,
          },
        },
      },
      hello: "there",
    });

    expect(target).toEqual({
      a: {
        b: {
          c: {
            d: 1,
            e: 2,
          },
        },
      },
      hello: "there",
    }); // Confirm in-place modification
  });

  it("creates new properties when target is missing keys", () => {
    const target = { a: 1 };
    const source = { b: { c: 2 } };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      a: 1,
      b: { c: 2 },
    });
  });

  it("handles null and undefined values in source", () => {
    const target = { a: 1, b: 2 };
    const source = { b: null, c: undefined };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: null, c: undefined });
  });

  it("handles null and undefined values in target", () => {
    const target = { a: null, b: undefined };
    const source = { a: { c: 3 }, b: 4 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: { c: 3 }, b: 4 });
  });

  it("does not modify source object", () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 } };

    const originalSource = { ...source };

    deepMerge(target, source);

    expect(source).toEqual(originalSource); // Source remains unchanged
  });

  it("merges empty objects correctly", () => {
    const target = {};
    const source = {};

    const result = deepMerge(target, source);

    expect(result).toEqual({});
  });

  it("handles non-object values in target and source", () => {
    const target = { a: 1 };
    const source = { a: { b: 2 } };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: { b: 2 } });
  });

  it("merges when target is missing a key entirely", () => {
    const target = {};
    const source = { a: { b: { c: 1 } } };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: { b: { c: 1 } } });
  });

  it("overwrites primitive values with objects", () => {
    const target = { a: 1 };
    const source = { a: { b: 2 } };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: { b: 2 } });
  });

  it("overwrites objects with primitive values", () => {
    const target = { a: { b: 2 } };
    const source = { a: 1 };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1 });
  });

  it("does not modify target keys if source does not contain them", () => {
    const target = { a: 1, b: 2 };
    const source = { b: undefined };

    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: undefined });
  });
});
