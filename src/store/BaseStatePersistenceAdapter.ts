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

  async ready(): Promise<void> {
    await this._handleReady();
  }

  async getAllKeys(): Promise<(keyof T)[]> {
    return this._handleGetAllKeys();
  }

  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    return this._handleGetAllValues();
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const item = await this._handleGetItem(key);
    return item;
  }

  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this._handleSetItem(key, value);
    this.emitUpdateEvent({ type: "setItem", key, value });
  }

  async removeItem<K extends keyof T>(key: K): Promise<void> {
    await this._handleRemoveItem(key);
    this.emitUpdateEvent({ type: "removeItem", key });
  }

  async clear(): Promise<void> {
    await this._handleClear();
    this.emitUpdateEvent({ type: "clear" });
  }

  protected abstract _handleReady(): Promise<void>;
  protected abstract _handleGetAllKeys(): Promise<(keyof T)[]>;
  protected abstract _handleGetAllValues<K extends keyof T>(): Promise<
    Array<T[K]>
  >;
  protected abstract _handleGetItem<K extends keyof T>(
    key: K,
  ): Promise<T[K] | undefined>;
  protected abstract _handleSetItem<K extends keyof T>(
    key: K,
    value: T[K],
  ): Promise<void>;
  protected abstract _handleRemoveItem<K extends keyof T>(
    key: K,
  ): Promise<void>;
  protected abstract _handleClear(): Promise<void>;
}
