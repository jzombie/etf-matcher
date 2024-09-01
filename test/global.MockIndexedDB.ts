import { EventEmitter } from "events";
import { vi } from "vitest";

// Base class for IndexedDB mock objects
class MockIDBRequest extends EventEmitter {
  result: any;
  error: any;

  constructor(result: any) {
    super();
    this.result = result;
    setTimeout(() => {
      this.dispatchEvent(new Event("success"));
    }, 0);
  }

  addEventListener(
    type: string,
    listener: (this: IDBRequest, ev: Event) => any,
  ) {
    this.on(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (this: IDBRequest, ev: Event) => any,
  ) {
    this.off(type, listener);
  }

  dispatchEvent(event: Event) {
    this.emit(event.type, { target: this });
    return true;
  }
}

// Mock for IDBCursor
class MockIDBCursor {
  update = vi.fn();
  advance = vi.fn();
  continue = vi.fn();
  continuePrimaryKey = vi.fn();
  delete = vi.fn();
}

// Mock for IDBIndex
class MockIDBIndex {
  get = vi.fn(() => new MockIDBRequest(null));
  getKey = vi.fn(() => new MockIDBRequest(null));
  getAll = vi.fn(() => new MockIDBRequest([]));
  getAllKeys = vi.fn(() => new MockIDBRequest([]));
  openCursor = vi.fn(() => new MockIDBRequest(new MockIDBCursor()));
  openKeyCursor = vi.fn(() => new MockIDBRequest(new MockIDBCursor()));
}

// Mock for IDBObjectStore
class MockIDBObjectStore {
  add = vi.fn();
  put = vi.fn();
  get = vi.fn(() => new MockIDBRequest(null));
  delete = vi.fn(() => new MockIDBRequest(null));
  clear = vi.fn(() => new MockIDBRequest(null));
  createIndex = vi.fn(() => new MockIDBIndex());
  index = vi.fn(() => new MockIDBIndex());
  openCursor = vi.fn(() => new MockIDBRequest(new MockIDBCursor()));
  openKeyCursor = vi.fn(() => new MockIDBRequest(new MockIDBCursor()));
  getAllKeys = vi.fn(() => new MockIDBRequest([]));
  getAll = vi.fn(() => new MockIDBRequest([]));
}

// Mock for IDBTransaction
class MockIDBTransaction extends EventEmitter {
  objectStore: any;

  constructor(objectStore: any) {
    super();
    this.objectStore = objectStore;
  }

  addEventListener(
    type: string,
    listener: (this: IDBTransaction, ev: Event) => any,
  ) {
    this.on(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (this: IDBTransaction, ev: Event) => any,
  ) {
    this.off(type, listener);
  }

  dispatchEvent(event: Event) {
    this.emit(event.type, { target: this });
    return true;
  }

  commit = vi.fn();
  abort = vi.fn();
}

// Mock for IDBDatabase
class MockIDBDatabase {
  createObjectStore = vi.fn(() => new MockIDBObjectStore());
  transaction = vi.fn(() => new MockIDBTransaction(new MockIDBObjectStore()));
  close = vi.fn();
  deleteObjectStore = vi.fn();
  // Note: These may not be standard here but `IndexedDBInterface` seems to require these here
  getAllKeys = vi.fn(() => new MockIDBRequest([]));
  getAll = vi.fn(() => new MockIDBRequest([]));
}

// Mock for IndexedDB
class MockIndexedDB {
  open = vi.fn(() => new MockIDBRequest(new MockIDBDatabase()));
  deleteDatabase = vi.fn(() => new MockIDBRequest(null));
}

// Assign the mock to global
(global as any).indexedDB = new MockIndexedDB();
(global as any).IDBRequest = MockIDBRequest;
(global as any).IDBTransaction = MockIDBTransaction;
(global as any).IDBDatabase = MockIDBDatabase;
(global as any).IDBObjectStore = MockIDBObjectStore;
(global as any).IDBIndex = MockIDBIndex;
(global as any).IDBCursor = MockIDBCursor;
