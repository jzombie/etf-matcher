// Custom type definitions for the SharedWorker global scope

interface SharedWorkerGlobalScope extends EventTarget {
  onconnect:
    | ((this: SharedWorkerGlobalScope, ev: MessageEvent) => unknown)
    | null;
  // eslint-disable-next-line no-undef
  location: WorkerLocation;
  // eslint-disable-next-line no-undef
  navigator: WorkerNavigator;
  close: () => void;
  importScripts(...urls: string[]): void;
  self: SharedWorkerGlobalScope;
}

declare let self: SharedWorkerGlobalScope;
