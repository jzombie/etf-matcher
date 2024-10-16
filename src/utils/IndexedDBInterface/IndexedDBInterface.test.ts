import { beforeEach, describe, expect, it, vi } from "vitest";

import IndexedDBInterface, {
  UPDATE_EVENT,
  UpdateEvent,
} from "../IndexedDBInterface";

// Define TestSchema as a Record<string, string>
type TestSchema = Record<string, string>;

describe("IndexedDBInterface", () => {
  let dbInterface: IndexedDBInterface<TestSchema>;

  beforeEach(() => {
    // Assign the fake-indexeddb to the global scope
    global.indexedDB = new IDBFactory();
    global.IDBKeyRange = IDBKeyRange;

    // Initialize the Dexie-based interface
    dbInterface = new IndexedDBInterface<TestSchema>("test-database");
  });

  it("should set and get an item", async () => {
    await dbInterface.setItem("testKey1", "testValue1");
    const value = await dbInterface.getItem("testKey1");
    expect(value).toBe("testValue1");
  });

  it("should remove an item", async () => {
    await dbInterface.setItem("testKey1", "testValue1");
    await dbInterface.removeItem("testKey1");
    const value = await dbInterface.getItem("testKey1");
    expect(value).toBeUndefined();
  });

  it("should clear all items", async () => {
    await dbInterface.setItem("testKey1", "testValue1");
    await dbInterface.setItem("testKey2", "testValue2");
    await dbInterface.clear();
    const keys = await dbInterface.getAllKeys();
    expect(keys.length).toBe(0);
  });

  it("should get all keys", async () => {
    await dbInterface.setItem("testKey1", "testValue1");
    await dbInterface.setItem("testKey2", "testValue2");
    const keys = await dbInterface.getAllKeys();
    expect(keys).toContain("testKey1");
    expect(keys).toContain("testKey2");
  });

  it("should get all values", async () => {
    await dbInterface.setItem("testKey1", "testValue1");
    await dbInterface.setItem("testKey2", "testValue2");
    const values = await dbInterface.getAllValues();
    expect(values).toContain("testValue1");
    expect(values).toContain("testValue2");
  });

  it("should emit update event on setItem", async () => {
    const spy = vi.fn();
    dbInterface.on(UPDATE_EVENT, spy);
    await dbInterface.setItem("testKey1", "testValue1");
    expect(spy).toHaveBeenCalledWith({
      type: "setItem",
      key: "testKey1",
      value: "testValue1",
    } as UpdateEvent<TestSchema>);
  });

  it("should emit update event on removeItem", async () => {
    const spy = vi.fn();
    dbInterface.on(UPDATE_EVENT, spy);
    await dbInterface.setItem("testKey1", "testValue1");
    await dbInterface.removeItem("testKey1");
    expect(spy).toHaveBeenCalledWith({
      type: "removeItem",
      key: "testKey1",
    } as UpdateEvent<TestSchema>);
  });

  it("should emit update event on clear", async () => {
    const spy = vi.fn();
    dbInterface.on(UPDATE_EVENT, spy);
    await dbInterface.clear();
    expect(spy).toHaveBeenCalledWith({
      type: "clear",
    } as UpdateEvent<TestSchema>);
  });
});
