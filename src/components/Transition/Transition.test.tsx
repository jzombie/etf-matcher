import React from "react";

import { act, render, screen, waitFor } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";

import Transition from "./Transition";

// Mock the animation end event
const triggerAnimationEnd = (element: HTMLElement) => {
  const event = new Event("animationend", { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
};

describe("Transition Component", () => {
  it("handles transition when trigger changes", async () => {
    const { rerender, asFragment } = render(
      <Transition trigger="initial">
        <div className="view">Initial View</div>
      </Transition>,
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="view"
              >
                Initial View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      rerender(
        <Transition trigger="next">
          <div className="view">Next View</div>
        </Transition>,
      );
    });

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated animate__slideOutRight"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="view"
              >
                Initial View
              </div>
            </div>
          </div>
          <div
            class="full transition_child_view next_view animate__animated animate__slideInLeft"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="view"
              >
                Next View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    await waitFor(() => {
      const activeElement = screen.getByText("Initial View").parentElement;
      if (activeElement) triggerAnimationEnd(activeElement);
    });

    await waitFor(() => {
      expect(screen.queryByText("Initial View")).toBeNull();
      expect(screen.getByText("Next View")).toBeDefined();
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="view"
                >
                  Next View
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });
  });

  it("re-renders when trigger changes", async () => {
    const renderSpy = vi.fn();
    const SpyComponent = ({ text }: { text: string }) => {
      renderSpy();
      return <div className="spy-view">{text}</div>;
    };

    const { rerender, asFragment } = render(
      <Transition trigger="initial">
        <SpyComponent text="Initial View" />
      </Transition>,
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      rerender(
        <Transition trigger="next">
          <SpyComponent text="Spy View" />
        </Transition>,
      );
    });

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated animate__slideOutRight"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
          <div
            class="full transition_child_view next_view animate__animated animate__slideInLeft"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Spy View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    await waitFor(() => {
      const activeElement = screen.getByText("Initial View").parentElement;
      if (activeElement) triggerAnimationEnd(activeElement);
    });

    await waitFor(() => {
      expect(screen.getByText("Spy View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="spy-view"
                >
                  Spy View
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });
  });

  // Additional tests for verifying re-renders and unnecessary renders
  it("does not re-render when trigger does not change", async () => {
    const renderSpy = vi.fn();
    const SpyComponent = ({ text }: { text: string }) => {
      renderSpy();
      return <div className="spy-view">{text}</div>;
    };

    const { rerender, asFragment } = render(
      <Transition trigger="initial">
        <SpyComponent text="Initial View" />
      </Transition>,
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      rerender(
        <Transition trigger="initial">
          <SpyComponent text="Initial View" />
        </Transition>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Initial View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="spy-view"
                >
                  Initial View
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });
  });

  it("re-renders only once when trigger changes multiple times in quick succession", async () => {
    const renderSpy = vi.fn();
    const SpyComponent = ({ text }: { text: string }) => {
      renderSpy();
      return <div className="spy-view">{text}</div>;
    };

    const { rerender, asFragment } = render(
      <Transition trigger="initial">
        <SpyComponent text="Initial View" />
      </Transition>,
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      rerender(
        <Transition trigger="next1">
          <SpyComponent text="Spy View 1" />
        </Transition>,
      );
      rerender(
        <Transition trigger="next2">
          <SpyComponent text="Spy View 2" />
        </Transition>,
      );
    });

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated animate__slideOutRight"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
          <div
            class="full transition_child_view next_view animate__animated animate__slideInLeft"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Spy View 2
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    await waitFor(() => {
      const activeElement = screen.getByText("Initial View").parentElement;
      if (activeElement) triggerAnimationEnd(activeElement);
    });

    await waitFor(() => {
      expect(screen.getByText("Spy View 2")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="spy-view"
                >
                  Spy View 2
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });
  });

  it("child component does not re-render unnecessarily", async () => {
    const renderSpy = vi.fn();
    const SpyComponent = ({ text }: { text: string }) => {
      renderSpy();
      return <div className="spy-view">{text}</div>;
    };

    const { rerender, asFragment } = render(
      <Transition trigger="initial">
        <SpyComponent text="Initial View" />
      </Transition>,
    );
    expect(screen.getByText("Initial View")).toBeDefined();
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
        >
          <div
            class="full transition_child_view animate__animated"
            style="animation-duration: 0.5s;"
          >
            <div
              class="full"
            >
              <div
                class="spy-view"
              >
                Initial View
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `);

    act(() => {
      rerender(
        <Transition trigger="initial">
          <SpyComponent text="Initial View" />
        </Transition>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Initial View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="spy-view"
                >
                  Initial View
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });

    act(() => {
      rerender(
        <Transition trigger="next">
          <SpyComponent text="Next View" />
        </Transition>,
      );
    });

    await waitFor(() => {
      const activeElement = screen.getByText("Initial View").parentElement;
      if (activeElement) triggerAnimationEnd(activeElement);
    });

    await waitFor(() => {
      expect(screen.getByText("Next View")).toBeDefined();
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          <div
            class="full"
          >
            <div
              class="full transition_child_view animate__animated"
              style="animation-duration: 0.5s;"
            >
              <div
                class="full"
              >
                <div
                  class="spy-view"
                >
                  Next View
                </div>
              </div>
            </div>
          </div>
        </DocumentFragment>
      `);
    });
  });
});
