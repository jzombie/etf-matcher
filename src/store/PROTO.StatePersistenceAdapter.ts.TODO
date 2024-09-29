export default interface StatePersistenceAdapter<T> {
  ready(): Promise<void>;
  getAllKeys(): Promise<(keyof T)[]>;
  getItem<K extends keyof T>(key: K): Promise<T[K] | undefined>;
  setItem<K extends keyof T>(key: K, value: T[K]): Promise<void>;
  removeItem<K extends keyof T>(key: K): Promise<void>;
  clear(): Promise<void>;
}
