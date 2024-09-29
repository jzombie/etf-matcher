import { EventEmitter } from "events";

export const UPDATE_EVENT = "update";

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "clear";
  key?: keyof T;
  value?: T[keyof T];
}

export default abstract class BaseStatePersistenceAdapter<
  T,
> extends EventEmitter {
  protected emitUpdateEvent(event: UpdateEvent<T>): void {
    this.emit(UPDATE_EVENT, event);
  }

  abstract ready(): Promise<void>;

  async getAllKeys(): Promise<(keyof T)[]> {
    return this._doGetAllKeys();
  }

  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    return this._doGetAllValues();
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const item = await this._doGetItem(key);
    return item;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this._doSetItem(key, value);
    this.emitUpdateEvent({ type: "setItem", key, value });
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    await this._doRemoveItem(key);
    this.emitUpdateEvent({ type: "removeItem", key });
  }

  async clear(): Promise<void> {
    await this._doClear();
    this.emitUpdateEvent({ type: "clear" });
  }

  protected abstract _doGetAllKeys(): Promise<(keyof T)[]>;
  protected abstract _doGetAllValues<K extends keyof T>(): Promise<Array<T[K]>>;
  protected abstract _doGetItem<K extends keyof T>(
    key: K,
  ): Promise<T[K] | undefined>;
  protected abstract _doSetItem<K extends keyof T>(
    key: K,
    value: T[K],
  ): Promise<void>;
  protected abstract _doRemoveItem<K extends keyof T>(key: K): Promise<void>;
  protected abstract _doClear(): Promise<void>;
}
