import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Full from "./Full";
import { describe, it, expect } from "vitest";

describe("Full Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Full>
        <span>Test Content</span>
      </Full>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
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
      <Full className="custom-class">
        <span>Test Content</span>
      </Full>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full custom-class"
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
      <Full ref={ref}>
        <span>Test Content</span>
      </Full>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
