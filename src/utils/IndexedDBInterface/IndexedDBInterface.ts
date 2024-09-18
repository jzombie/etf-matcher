import Dexie, { Table } from "dexie";
import { EventEmitter } from "events";

// Define the database schema
export interface MyDBSchema {
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

// Create a Dexie database class
export default class IndexedDBInterface<
  T extends Record<string, unknown>,
> extends EventEmitter {
  private _databaseName: string;
  private _db: Dexie & {
    keyval: Table<{ key: string; value: T[keyof T] }, string>;
  };

  constructor(databaseName: string = "my-database2") {
    super();
    this._databaseName = databaseName;

    // Initialize Dexie and define the schema
    this._db = new Dexie(databaseName) as Dexie & {
      keyval: Table<{ key: string; value: T[keyof T] }, string>;
    };

    this._db.version(1).stores({
      keyval: "key", // 'key' is the primary key
    });
  }

  // Ensure that the database is ready (Dexie is always ready after initialization)
  public async ready(): Promise<Dexie> {
    return this._db;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this._db.keyval.put({ key: key as string, value });
    this.emit(UPDATE_EVENT, { type: "setItem", key, value } as UpdateEvent<T>);
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const entry = await this._db.keyval.get(key as string);
    return entry ? (entry.value as T[K]) : undefined;
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    await this._db.keyval.delete(key as string);
    this.emit(UPDATE_EVENT, { type: "removeItem", key } as UpdateEvent<T>);
  }

  async clear(): Promise<void> {
    await this._db.keyval.clear();
    this.emit(UPDATE_EVENT, { type: "clear" } as UpdateEvent<T>);
  }

  async getAllKeys<K extends keyof T>(): Promise<K[]> {
    const keys = await this._db.keyval.toCollection().keys();
    return keys as K[];
  }

  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    const values = await this._db.keyval.toArray();
    // TODO: Use proper types instead of `unknown` if possible
    return values.map((item: { value: unknown }) => item.value) as Array<T[K]>;
  }
}
