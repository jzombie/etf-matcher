import { EventEmitter } from "events";
import { DBSchema, IDBPDatabase, openDB } from "idb";

// TODO: Use constant for `keyval`

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "clear";
  key?: keyof T;
  value?: T[keyof T];
}

export const UPDATE_EVENT = "update";

interface MyDB<T extends Record<string, unknown>> extends DBSchema {
  keyval: {
    key: string;
    value: T[keyof T];
  };
}

export default class IndexedDBInterface<
  T extends Record<string, unknown>,
> extends EventEmitter {
  private _databaseName: string;
  private _dbPromise: Promise<IDBPDatabase<MyDB<T>>>;

  constructor(databaseName: string = "my-database") {
    super();
    this._databaseName = databaseName;

    // Open the database
    this._dbPromise = openDB<MyDB<T>>(databaseName, 1, {
      upgrade(db) {
        // Create a store with out-of-line keys
        db.createObjectStore("keyval");
      },
    });
  }

  // Ensure that the database is ready
  public async ready(): Promise<IDBPDatabase<MyDB<T>>> {
    return this._dbPromise;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const db = await this._dbPromise;
    await db.put("keyval", value, key as string);
    this.emit(UPDATE_EVENT, { type: "setItem", key, value } as UpdateEvent<T>);
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const db = await this._dbPromise;
    const value = await db.get("keyval", key as string);
    return value as T[K];
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    const db = await this._dbPromise;
    await db.delete("keyval", key as string);
    this.emit(UPDATE_EVENT, { type: "removeItem", key } as UpdateEvent<T>);
  }

  async clear(): Promise<void> {
    const db = await this._dbPromise;
    await db.clear("keyval");
    this.emit(UPDATE_EVENT, { type: "clear" } as UpdateEvent<T>);
  }

  async getAllKeys<K extends keyof T>(): Promise<K[]> {
    const db = await this._dbPromise;
    const keys = await db.getAllKeys("keyval");
    return keys as K[];
  }

  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    const db = await this._dbPromise;
    const values = await db.getAll("keyval");
    return values as Array<T[K]>;
  }
}
