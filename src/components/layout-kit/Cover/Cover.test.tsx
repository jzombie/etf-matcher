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
});
