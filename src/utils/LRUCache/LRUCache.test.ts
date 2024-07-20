import { describe, it, expect, beforeEach } from "vitest";
import LRUCache from "./LRUCache";

describe("LRUCache", () => {
  let cache: LRUCache<string, string>;

  beforeEach(() => {
    cache = new LRUCache<string, string>(3); // setting limit to 3 for testing
  });

  it("should set and get values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return null for missing keys", () => {
    expect(cache.get("key1")).toBeNull();
  });

  it("should evict the least recently used item when the limit is exceeded", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3");
    cache.set("key4", "value4"); // this should evict 'key1'

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBe("value3");
    expect(cache.get("key4")).toBe("value4");
  });

  it("should update the position of recently accessed items", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3");

    cache.get("key1"); // access 'key1' to make it the most recently used
    cache.set("key4", "value4"); // this should evict 'key2' instead of 'key1'

    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("key2")).toBeNull();
    expect(cache.get("key3")).toBe("value3");
    expect(cache.get("key4")).toBe("value4");
  });

  it("should handle overwriting existing keys correctly", () => {
    cache.set("key1", "value1");
    cache.set("key1", "value2"); // overwrite 'key1'

    expect(cache.get("key1")).toBe("value2");
  });

  it("should handle setting and getting multiple types", () => {
    const numberCache = new LRUCache<number, number>(3);
    numberCache.set(1, 100);
    numberCache.set(2, 200);
    numberCache.set(3, 300);

    expect(numberCache.get(1)).toBe(100);
    expect(numberCache.get(2)).toBe(200);
    expect(numberCache.get(3)).toBe(300);
  });
});
