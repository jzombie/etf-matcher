import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Cover from "./Cover";
import { describe, it, expect } from "vitest";

describe("Cover Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Cover>
        <span>Test Content</span>
      </Cover>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full cover"
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
      <Cover className="custom-class">
        <span>Test Content</span>
      </Cover>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full cover custom-class"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("allows click through when clickThrough prop is true", () => {
    const { container } = render(
      <Cover clickThrough>
        <span>Test Content</span>
      </Cover>
    );
    expect(container.firstChild).toHaveClass("clickThrough");
  });

  it("does not allow click through when clickThrough prop is false", () => {
    const { container } = render(
      <Cover clickThrough={false}>
        <span>Test Content</span>
      </Cover>
    );
    expect(container.firstChild).not.toHaveClass("clickThrough");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Cover ref={ref}>
        <span>Test Content</span>
      </Cover>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
