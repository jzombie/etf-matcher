import { vi } from "vitest";

// Mock for Worker API
class MockWorker {
  constructor(stringUrl: string) {
    this.url = stringUrl;
  }
  url: string;
  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage = vi.fn();
  onerror = vi.fn();
}

global.Worker = MockWorker as any;
