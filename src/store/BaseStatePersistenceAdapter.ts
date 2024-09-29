import { EventEmitter } from "events";

export const UPDATE_EVENT = "update";

export interface UpdateEvent<T> {
  type: "setItem" | "removeItem" | "clear";
  key?: keyof T;
  value?: T[keyof T];
}

// Abstract class for state persistence adapters
export default abstract class BaseStatePersistenceAdapter<
  T,
> extends EventEmitter {
  // Emit an update event with the given payload
  protected emitUpdateEvent(event: UpdateEvent<T>): void {
    this.emit(UPDATE_EVENT, event);
  }

  // Public method to be called when the adapter is ready
  async ready(): Promise<void> {
    await this._handleReady();
  }

  // Public method to get all keys from the state
  async getAllKeys(): Promise<(keyof T)[]> {
    return this._handleGetAllKeys();
  }

  // Public method to get all values from the state
  async getAllValues<K extends keyof T>(): Promise<Array<T[K]>> {
    return this._handleGetAllValues();
  }

  // Public method to get a specific item from the state by key
  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const item = await this._handleGetItem(key);
    return item;
  }

  // Public method to set a specific item in the state by key and value
  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this._handleSetItem(key, value);
    this.emitUpdateEvent({ type: "setItem", key, value });
  }

  // Public method to remove a specific item from the state by key
  async removeItem<K extends keyof T>(key: K): Promise<void> {
    await this._handleRemoveItem(key);
    this.emitUpdateEvent({ type: "removeItem", key });
  }

  // Public method to clear all items from the state
  async clear(): Promise<void> {
    await this._handleClear();
    this.emitUpdateEvent({ type: "clear" });
  }

  // Abstract methods to be implemented by subclasses
  // The `_handle` prefix is used to indicate that these methods are internal handlers
  // that perform the actual operations. This helps distinguish them from the public
  // methods that call these handlers.
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
