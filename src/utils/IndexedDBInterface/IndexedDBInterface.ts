import { EventEmitter } from "events";
import { DBSchema, IDBPDatabase, deleteDB, openDB } from "idb";

// TODO: Replace with `localForage`?

interface MyDB extends DBSchema {
  keyval: {
    key: string;
    value: unknown;
  };
}

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "delete";
  key?: keyof T;
  value?: T[keyof T];
}

export const UPDATE_EVENT = "update";

export default class IndexedDBInterface<
  T extends Record<string, unknown>,
> extends EventEmitter {
  private _dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor(databaseName: string = "my-database") {
    super();

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

  clear() {
    throw new Error("`clear` is not implemnted here. Call `delete` instead.");
  }

  // FIXME: There has been some inconsistent handling between the tests and the
  // actual handling in Chrome.
  //
  // Calling `clear` seems to not clear the values in Chrome, so a combination
  // of `clear` and `delete` is currently used as a workaround.
  async delete(): Promise<void> {
    const db = await this.getDB();

    await db.clear("keyval");

    // FIXME: This seems to incorrectly identify itself as a promise, yet never
    // resolves. It may actually just be a synchronous method.
    //
    // I think this may justify replacing with `localForage`
    //
    // See this comment: https://github.com/jakearchibald/idb/issues/309#issuecomment-2329777429
    deleteDB(db.name);

    this.emit(UPDATE_EVENT, { type: "delete" } as UpdateEvent<T>);
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
