import "@testing-library/jest-dom";

type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void;

class ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Simulate an initial call to the callback with the target element
    const contentRect = target.getBoundingClientRect();
    const entry: ResizeObserverEntry = {
      target,
      contentRect,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    };
    this.callback([entry], this);
  }

  unobserve() {
    // Mock method
  }

  disconnect() {
    // Mock method
  }
}

// Assign the mock ResizeObserver to the global object
global.ResizeObserver = ResizeObserver;
