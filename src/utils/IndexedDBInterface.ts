import { DBSchema, IDBPDatabase, openDB } from "idb";

interface MyDB extends DBSchema {
  keyval: {
    key: string;
    value: unknown;
  };
}

export default class IndexedDBInterface<T extends Record<string, unknown>> {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>("my-database", 1, {
      upgrade(db) {
        db.createObjectStore("keyval");
      },
    });
  }

  public async ready(): Promise<IDBPDatabase<MyDB>> {
    return this.dbPromise;
  }

  private async getDB(): Promise<IDBPDatabase<MyDB>> {
    return this.dbPromise;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const db = await this.getDB();
    await db.put("keyval", value, key as string);
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const db = await this.getDB();
    return (await db.get("keyval", key as string)) as T[K];
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    const db = await this.getDB();
    await db.delete("keyval", key as string);
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear("keyval");
  }

  async getAllKeys<K extends keyof T>(): Promise<K[]> {
    const db = await this.getDB();
    const keys = await db.getAllKeys("keyval");
    return keys as K[];
  }

  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    const db = await this.getDB();
    const values = await db.getAll("keyval");
    return values as Array<T[K]>;
  }
}
