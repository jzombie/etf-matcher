import { EventEmitter } from "events";
import { DBSchema, IDBPDatabase, openDB } from "idb";

interface MyDB extends DBSchema {
  keyval: {
    key: string;
    value: unknown;
  };
}

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "clear";
  key?: keyof T;
  value?: T[keyof T];
}

export const UPDATE_EVENT = "update";

export default class IndexedDBInterface<
  T extends Record<string, unknown>,
> extends EventEmitter {
  private _databaseName: string;
  private _dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor(databaseName: string = "my-database") {
    super();

    this._databaseName = databaseName;

    this._dbPromise = openDB<MyDB>(databaseName, 1, {
      upgrade(db) {
        db.createObjectStore("keyval");
      },
    });
  }

  public async ready(): Promise<IDBPDatabase<MyDB>> {
    return this._dbPromise;
  }

  private async getDB(): Promise<IDBPDatabase<MyDB>> {
    return this._dbPromise;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const db = await this.getDB();
    await db.put("keyval", value, key as string);
    this.emit(UPDATE_EVENT, { type: "setItem", key, value } as UpdateEvent<T>);
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const db = await this.getDB();
    return (await db.get("keyval", key as string)) as T[K];
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    const db = await this.getDB();
    await db.delete("keyval", key as string);
    this.emit(UPDATE_EVENT, { type: "removeItem", key } as UpdateEvent<T>);
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear("keyval");
    this.emit(UPDATE_EVENT, { type: "clear" } as UpdateEvent<T>);
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
