// deepClone.test.ts
import { describe, it, expect } from "vitest";
import deepClone from "./deepClone";
import deepEqual from "../deepEqual";

describe("deepClone function", () => {
  it("should handle self-identity", () => {
    const obj1 = { foo: "bar" };
    const clone1 = deepClone(obj1);
    expect(deepEqual(clone1, obj1)).toBe(true);

    const obj2: any = { foo: "hello", sub: { a: 1 } };
    obj2.sub.b = obj2;

    const clone2 = deepClone(obj2);
    expect(deepEqual(clone2, obj2)).toBe(true);
  });

  it("should handle cyclic references without infinite loop", () => {
    const obj1: any = { a: 1 };
    obj1.self = obj1; // Create cyclic reference

    const clone1 = deepClone(obj1);
    expect(deepEqual(clone1, obj1)).toBe(true);
    expect(clone1).not.toBe(obj1);
    expect(clone1.self).toBe(clone1);

    const obj2: any = { a: 1 };
    obj2.self = obj2; // Create cyclic reference

    const clone2 = deepClone(obj2);
    expect(deepEqual(clone2, obj2)).toBe(true);
    expect(clone2).not.toBe(obj2);
    expect(clone2.self).toBe(clone2);
  });

  it("should handle deeper cyclic references", () => {
    const obj1: any = { a: { b: 1 } };
    obj1.a.c = obj1; // Create deeper cyclic reference

    const clone1 = deepClone(obj1);
    expect(deepEqual(clone1, obj1)).toBe(true);
    expect(clone1).not.toBe(obj1);
    expect(clone1.a.c).toBe(clone1);

    const obj2: any = { a: { b: 1 } };
    obj2.a.c = obj2; // Create deeper cyclic reference

    const clone2 = deepClone(obj2);
    expect(deepEqual(clone2, obj2)).toBe(true);
    expect(clone2).not.toBe(obj2);
    expect(clone2.a.c).toBe(clone2);
  });

  it("should clone primitive values correctly", () => {
    expect(deepClone(1)).toBe(1);
    expect(deepClone("a")).toBe("a");
    expect(deepClone(true)).toBe(true);
  });

  it("should clone deeply equal objects", () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj1);
    expect(deepEqual(clone, obj1)).toBe(true);
  });

  it("should clone arrays correctly", () => {
    const arr1 = [1, 2, { a: 3 }];
    const clone = deepClone(arr1);
    expect(deepEqual(clone, arr1)).toBe(true);
  });

  it("should clone Date objects correctly", () => {
    const date1 = new Date("2023-07-06T12:00:00Z");
    const clone = deepClone(date1);
    expect(deepEqual(clone, date1)).toBe(true);
  });

  it("should clone functions correctly", () => {
    const func1 = () => {};
    const clone = deepClone(func1);
    expect(clone).toBe(func1); // Functions should not be deeply cloned, should be the same reference
  });

  it("should clone objects with nested arrays and objects correctly", () => {
    const obj1 = { a: 1, b: { c: 2, d: [3, 4, { e: 5 }] } };
    const clone = deepClone(obj1);
    expect(deepEqual(clone, obj1)).toBe(true);
  });

  it("should handle null and undefined correctly", () => {
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  it("should deep clone nested objects and ensure their values are the same, but their references are different", () => {
    const obj1 = { a: 1, b: { c: 2, d: [3, 4, { e: 5 }] } };
    const clone = deepClone(obj1);

    expect(deepEqual(clone, obj1)).toBe(true);

    // Check if references are different
    expect(clone).not.toBe(obj1);
    expect(clone.b).not.toBe(obj1.b);
    expect(clone.b.d).not.toBe(obj1.b.d);
    expect(clone.b.d[2]).not.toBe(obj1.b.d[2]);
  });

  it("should deep clone nested arrays and ensure their values are the same, but their references are different", () => {
    const arr1 = [1, [2, 3], { a: 4 }];
    const clone = deepClone(arr1);

    expect(deepEqual(clone, arr1)).toBe(true);

    // Check if references are different
    expect(clone).not.toBe(arr1);
    expect(clone[1]).not.toBe(arr1[1]);
    expect(clone[2]).not.toBe(arr1[2]);
  });

  it("should deep clone objects with nested dates and ensure their values are the same, but their references are different", () => {
    const obj1 = {
      a: new Date("2023-07-06T12:00:00Z"),
      b: { c: new Date("2023-07-06T12:00:00Z") },
    };
    const clone = deepClone(obj1);

    expect(deepEqual(clone, obj1)).toBe(true);

    // Check if references are different
    expect(clone).not.toBe(obj1);
    expect(clone.a).not.toBe(obj1.a);
    expect(clone.b).not.toBe(obj1.b);
    expect(clone.b.c).not.toBe(obj1.b.c);
  });
});
