import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, it } from "vitest";

import Scrollable from "./Scrollable";
import styles from "./Scrollable.module.scss";

describe("Scrollable Component", () => {
  it("resets scroll position when trigger changes", () => {
    const { container, rerender } = render(
      <Scrollable resetTrigger="initial">
        <span>Test Content</span>
      </Scrollable>,
    );

    const scrollableDiv = container.firstChild as HTMLDivElement;

    // Simulate scrolling
    scrollableDiv.scrollTop = 100;
    scrollableDiv.scrollLeft = 100;

    expect(scrollableDiv.scrollTop).toBe(100);
    expect(scrollableDiv.scrollLeft).toBe(100);

    // Change the trigger prop
    rerender(
      <Scrollable resetTrigger="updated">
        <span>Test Content</span>
      </Scrollable>,
    );

    // Check that the scroll position has been reset
    expect(scrollableDiv.scrollTop).toBe(0);
    expect(scrollableDiv.scrollLeft).toBe(0);
  });

  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Scrollable>
        <span>Test Content</span>
      </Scrollable>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="scrollable scroll_y"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Scrollable className="custom-class">
        <span>Test Content</span>
      </Scrollable>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="scrollable scroll_y custom-class"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("enables horizontal scrolling when scrollX is true", () => {
    const { container, asFragment } = render(
      <Scrollable scrollX>
        <span>Test Content</span>
      </Scrollable>,
    );
    expect(container.firstChild).toHaveClass(styles.scroll_x);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="scrollable scroll_x scroll_y"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("enables vertical scrolling when scrollY is true", () => {
    const { container, asFragment } = render(
      <Scrollable scrollY>
        <span>Test Content</span>
      </Scrollable>,
    );
    expect(container.firstChild).toHaveClass(styles.scroll_y);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="scrollable scroll_y"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Scrollable ref={ref}>
        <span>Test Content</span>
      </Scrollable>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
