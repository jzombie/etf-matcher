import React from "react";

import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import LazyRender from "./LazyRender";

describe("LazyRender", () => {
  it("should render children when they become visible", () => {
    let callback: IntersectionObserverCallback | null = null;

    // Mock the IntersectionObserver
    global.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;

    render(
      <LazyRender data-testid="lazy-container">
        <div data-testid="lazy-element">Lazy Loaded Element</div>
      </LazyRender>,
    );

    // Ensure the element is not in the document initially
    expect(screen.queryByTestId("lazy-element")).not.toBeInTheDocument();

    // Simulate the IntersectionObserver callback
    act(() => {
      if (callback) {
        const entry = {
          isIntersecting: true,
          target: screen.getByTestId("lazy-container"),
        } as unknown as IntersectionObserverEntry;
        callback([entry], null as any);
      }
    });

    // Ensure the element is now in the document
    expect(screen.getByTestId("lazy-element")).toBeInTheDocument();
  });

  it("should not call observe after initial render when already visible", () => {
    let callback: IntersectionObserverCallback | null = null;

    // Mock the IntersectionObserver
    global.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;

    const observeSpy = vi.spyOn(
      global.IntersectionObserver.prototype,
      "observe",
    );
    const unobserveSpy = vi.spyOn(
      global.IntersectionObserver.prototype,
      "unobserve",
    );

    const { rerender } = render(
      <LazyRender data-testid="lazy-container">
        <div data-testid="lazy-element">Lazy Loaded Element</div>
      </LazyRender>,
    );

    // Ensure the element is not in the document initially
    expect(screen.queryByTestId("lazy-element")).not.toBeInTheDocument();

    // Simulate the IntersectionObserver callback
    act(() => {
      if (callback) {
        const entry = {
          isIntersecting: true,
          target: screen.getByTestId("lazy-container"),
        } as unknown as IntersectionObserverEntry;
        callback([entry], null as any);
      }
    });

    // Ensure observe and unobserve were initially called
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(unobserveSpy).toHaveBeenCalledTimes(1);

    // Ensure the element is now in the document
    expect(screen.getByTestId("lazy-element")).toBeInTheDocument();

    // Re-render the component to simulate a state update or props change
    rerender(
      <LazyRender data-testid="lazy-container">
        <div data-testid="lazy-element">Lazy Loaded Element</div>
      </LazyRender>,
    );

    // Ensure observe and unobserve were not called again after the element is already visible
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(unobserveSpy).toHaveBeenCalledTimes(1);

    observeSpy.mockRestore();
    unobserveSpy.mockRestore();
  });
});
