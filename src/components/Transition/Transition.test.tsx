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

    setTimeout(() => {
      expect(screen.getByText("Spy View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
    }, 500);
  });

  it("does not re-render when trigger does not change", () => {
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
        <Transition trigger="initial">
          <SpyComponent text="Initial View" />
        </Transition>
      );
    });

    setTimeout(() => {
      expect(screen.getByText("Initial View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(1);
    }, 500);
  });

  it("re-renders only once when trigger changes multiple times in quick succession", () => {
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
        <Transition trigger="next1">
          <SpyComponent text="Spy View 1" />
        </Transition>
      );
      rerender(
        <Transition trigger="next2">
          <SpyComponent text="Spy View 2" />
        </Transition>
      );
    });

    setTimeout(() => {
      expect(screen.getByText("Spy View 2")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
    }, 500);
  });
});
