import { describe, it, expect } from "vitest";
import deepFreeze from "./deepFreeze";

describe("deepFreeze", () => {
  it("should freeze an object", () => {
    const obj = { a: 1, b: 2 };
    const frozenObj = deepFreeze(obj);

    expect(Object.isFrozen(frozenObj)).toBe(true);
    expect(() => {
      (frozenObj as any).a = 3;
    }).toThrow();
  });

  it("should freeze nested objects", () => {
    const obj = { a: 1, b: { c: 2 } };
    const frozenObj = deepFreeze(obj);

    expect(Object.isFrozen(frozenObj)).toBe(true);
    expect(Object.isFrozen(frozenObj.b)).toBe(true);
    expect(() => {
      (frozenObj.b as any).c = 3;
    }).toThrow();
  });

  it("should freeze arrays", () => {
    const arr = [1, 2, { a: 3 }];
    const frozenArr = deepFreeze(arr);

    expect(Object.isFrozen(frozenArr)).toBe(true);
    expect(Object.isFrozen(frozenArr[2])).toBe(true);
    expect(() => {
      frozenArr.push(4);
    }).toThrow();
    expect(() => {
      (frozenArr[2] as any).a = 4;
    }).toThrow();
  });

  it("should handle cyclic references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;

    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBe(true);
    expect(Object.isFrozen(frozenObj.self)).toBe(true);
    expect(() => {
      frozenObj.a = 2;
    }).toThrow();
    expect(() => {
      frozenObj.self.a = 2;
    }).toThrow();
  });

  it("should handle objects with no properties", () => {
    const obj = {};
    const frozenObj = deepFreeze(obj);

    expect(Object.isFrozen(frozenObj)).toBe(true);
  });

  it("should handle non-object types gracefully", () => {
    const nonObject = "string" as any;
    expect(deepFreeze(nonObject)).toBe("string");
  });
});
