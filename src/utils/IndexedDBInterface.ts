import { DBSchema, IDBPDatabase, openDB } from "idb";

interface MyDB<T> extends DBSchema {
  keyval: {
    key: string;
    value: T;
  };
}

export default class IndexedDBInterface<T> {
  private dbPromise: Promise<IDBPDatabase<MyDB<T>>>;

  constructor() {
    this.dbPromise = openDB<MyDB<T>>("my-database", 1, {
      upgrade(db) {
        db.createObjectStore("keyval");
      },
    });
  }

  private async getDB(): Promise<IDBPDatabase<MyDB<T>>> {
    return this.dbPromise;
  }

  async setItem(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    await db.put("keyval", value, key);
  }

  async getItem(key: string): Promise<T | undefined> {
    const db = await this.getDB();
    return await db.get("keyval", key);
  }

  async removeItem(key: string): Promise<void> {
    const db = await this.getDB();
    await db.delete("keyval", key);
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear("keyval");
  }

  async getAllKeys(): Promise<string[]> {
    const db = await this.getDB();
    return await db.getAllKeys("keyval");
  }

  async getAllValues(): Promise<T[]> {
    const db = await this.getDB();
    return await db.getAll("keyval");
  }
}
