import { Store } from "@src/store";
import BaseStatePersistenceAdapter from "@src/store/BaseStatePersistenceAdapter";
import { DBSchema, IDBPDatabase, openDB } from "idb";

const KEYVAL_STORE_NAME = "keyval";

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "clear";
  key?: keyof T;
  value?: T[keyof T];
}

export const UPDATE_EVENT = "update";

interface MyDB<T extends Record<string, unknown>> extends DBSchema {
  [KEYVAL_STORE_NAME]: {
    key: string;
    value: T[keyof T];
  };
}

export default class IndexedDBService<
  T extends Record<string, unknown>,
> extends BaseStatePersistenceAdapter<T> {
  private _dbPromise: Promise<IDBPDatabase<MyDB<T>>>;

  constructor(store: Store, databaseName: string = "my-database") {
    super(store);

    // Open the database
    this._dbPromise = openDB<MyDB<T>>(databaseName, 1, {
      upgrade(db) {
        // Create a store with out-of-line keys
        db.createObjectStore(KEYVAL_STORE_NAME);
      },
    });
  }

  // Ensure that the database is ready
  protected async _onReady(): Promise<void> {
    await this._dbPromise;
  }

  protected async _onGetItem<K extends keyof T>(
    key: K,
  ): Promise<T[K] | undefined> {
    const db = await this._dbPromise;
    const value = await db.get(KEYVAL_STORE_NAME, key as string);
    return value as T[K];
  }

  protected async _onSetItem<K extends keyof T>(
    key: K,
    value: T[K],
  ): Promise<void> {
    const db = await this._dbPromise;
    await db.put(KEYVAL_STORE_NAME, value, key as string);
  }

  protected async _onRemoveItem<K extends keyof T>(key: K): Promise<void> {
    const db = await this._dbPromise;
    await db.delete(KEYVAL_STORE_NAME, key as string);
  }

  protected async _onClear(): Promise<void> {
    const db = await this._dbPromise;
    await db.clear(KEYVAL_STORE_NAME);
  }

  protected async _onGetAllKeys(): Promise<(keyof T)[]> {
    const db = await this._dbPromise;
    const keys = await db.getAllKeys(KEYVAL_STORE_NAME);
    return keys as (keyof T)[];
  }

  protected async _onGetAllValues(): Promise<Array<T[keyof T]>> {
    const db = await this._dbPromise;
    const values = await db.getAll(KEYVAL_STORE_NAME);
    return values as Array<T[keyof T]>;
  }
}
