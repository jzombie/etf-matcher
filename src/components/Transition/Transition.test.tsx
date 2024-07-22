import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import Transition from "./Transition";

describe("Transition Component", () => {
  it("handles transition when trigger changes", () => {
    const { rerender } = render(
      <Transition trigger="initial">
        <div className="view">Initial View</div>
      </Transition>
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    act(() => {
      rerender(
        <Transition trigger="next">
          <div className="view">Next View</div>
        </Transition>
      );
    });
    // Using setTimeout to wait for the transition to complete
    setTimeout(() => {
      expect(screen.queryByText("Initial View")).toBeNull();
      expect(screen.getByText("Next View")).toBeDefined();
    }, 500);
  });

  it("re-renders when trigger changes", () => {
    const renderSpy = vi.fn();
    const SpyComponent = ({ text }: { text: string }) => {
      renderSpy();
      return <div className="spy-view">{text}</div>;
    };
    const { rerender } = render(
      <Transition trigger="initial">
        <SpyComponent text="Initial View" />
      </Transition>
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    act(() => {
      rerender(
        <Transition trigger="next">
          <SpyComponent text="Spy View" />
        </Transition>
      );
    });
    // Using setTimeout to wait for the transition to complete
    setTimeout(() => {
      expect(screen.getByText("Spy View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
    }, 500);
  });
});
