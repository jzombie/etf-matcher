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

  it("should pass additional props to the div", () => {
    render(
      <LazyRender data-testid="lazy-container" className="extra-class">
        <div>Content</div>
      </LazyRender>,
    );

    const container = screen.getByTestId("lazy-container");
    expect(container).toHaveClass("extra-class");
  });
});
