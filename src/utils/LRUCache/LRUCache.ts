export default class LRUCache<K, V> {
  protected _cache: Map<K, V>;
  protected _limit: number;

  constructor(limit = 100) {
    this._cache = new Map<K, V>();
    this._limit = limit;
  }

  get(key: K): V | null {
    if (!this._cache.has(key)) {
      return null;
    }
    // Move the accessed key to the end to mark it as recently used
    const value = this._cache.get(key);
    this._cache.delete(key);
    if (value !== undefined) {
      this._cache.set(key, value);
    }
    return value as V | null;
  }

  set(key: K, value: V): void {
    if (this._cache.has(key)) {
      // Remove the key to update its position as the most recently used
      this._cache.delete(key);
    } else if (this._cache.size >= this._limit) {
      // Ensure `oldestKey` is defined before calling `.delete`
      const oldestKey = this._cache.keys().next().value;
      if (oldestKey !== undefined) {
        this._cache.delete(oldestKey);
      }
    }
    // Add the key and value to the cache
    this._cache.set(key, value);
  }
}
