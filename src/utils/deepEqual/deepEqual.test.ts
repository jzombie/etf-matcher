// deepEqual.test.ts
import { describe, it, expect } from "vitest";
import deepEqual from "./deepEqual";

describe("deepEqual function", () => {
  it("should handle cyclic references without infinite loop", () => {
    const obj1: any = { a: 1 };
    obj1.self = obj1; // Create cyclic reference

    const obj2: any = { a: 1 };
    obj2.self = obj2; // Create cyclic reference

    expect(deepEqual(obj1, obj2)).toBe(true);

    const obj3: any = { a: 1 };
    obj3.self = obj3; // Create cyclic reference

    const obj4: any = { a: 1 };
    obj4.self = { a: 1 }; // Different structure

    expect(deepEqual(obj3, obj4)).toBe(false);
  });

  it("should handle deeper cyclic references", () => {
    const obj1: any = { a: { b: 1 } };
    obj1.a.c = obj1; // Create deeper cyclic reference

    const obj2: any = { a: { b: 1 } };
    obj2.a.c = obj2; // Create deeper cyclic reference

    expect(deepEqual(obj1, obj2)).toBe(true);

    const obj3: any = { a: { b: 1 } };
    obj3.a.c = obj3; // Create deeper cyclic reference

    const obj4: any = { a: { b: 1, c: {} } };
    obj4.a.c.self = obj4; // Different structure

    expect(deepEqual(obj3, obj4)).toBe(false);
  });

  it("should return true for identical primitive values", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("a", "a")).toBe(true);
  });

  it("should return false for different primitive values", () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "b")).toBe(false);
  });

  it("should return true for deeply equal objects", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it("should return false for objects with different values", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it("should return false for objects with different keys", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { d: 2 } };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it("should return false if one object is null", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = null;
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it("should return true for deeply equal arrays", () => {
    const arr1 = [1, 2, { a: 3 }];
    const arr2 = [1, 2, { a: 3 }];
    expect(deepEqual(arr1, arr2)).toBe(true);
  });

  it("should return false for arrays with different values", () => {
    const arr1 = [1, 2, { a: 3 }];
    const arr2 = [1, 2, { a: 4 }];
    expect(deepEqual(arr1, arr2)).toBe(false);
  });

  it("should return true for identical Date objects", () => {
    const date1 = new Date("2023-07-06T12:00:00Z");
    const date2 = new Date("2023-07-06T12:00:00Z");
    expect(deepEqual(date1, date2)).toBe(true);
  });

  it("should return false for different Date objects", () => {
    const date1 = new Date("2023-07-06T12:00:00Z");
    const date2 = new Date("2023-07-07T12:00:00Z");
    expect(deepEqual(date1, date2)).toBe(false);
  });

  it("should return true for deeply equal objects with nested Date objects", () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
        d: new Date("2023-07-06T12:00:00Z"),
      },
    };
    const obj2 = {
      a: 1,
      b: {
        c: 2,
        d: new Date("2023-07-06T12:00:00Z"),
      },
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it("should return false for objects with nested Date objects with different values", () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
        d: new Date("2023-07-06T12:00:00Z"),
      },
    };
    const obj2 = {
      a: 1,
      b: {
        c: 2,
        d: new Date("2023-07-07T12:00:00Z"),
      },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it("should return true for identical functions", () => {
    const func1 = () => {};
    const func2 = func1;
    expect(deepEqual(func1, func2)).toBe(true);
  });

  it("should return false for different functions", () => {
    const func1 = () => {};
    const func2 = () => {};
    expect(deepEqual(func1, func2)).toBe(false);
  });

  it("should return true for deeply equal objects with nested arrays and objects", () => {
    const obj1 = {
      a: 1,
      b: { c: 2, d: [3, 4, { e: 5 }] },
    };
    const obj2 = {
      a: 1,
      b: { c: 2, d: [3, 4, { e: 5 }] },
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
  });

  it("should return false for deeply unequal objects with nested arrays and objects", () => {
    const obj1 = {
      a: 1,
      b: { c: 2, d: [3, 4, { e: 5 }] },
    };
    const obj2 = {
      a: 1,
      b: { c: 2, d: [3, 4, { e: 6 }] },
    };
    expect(deepEqual(obj1, obj2)).toBe(false);
  });
});
