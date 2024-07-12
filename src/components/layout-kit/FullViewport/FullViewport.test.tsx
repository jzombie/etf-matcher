import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import FullViewport from "./FullViewport";
import { describe, it, expect } from "vitest";

describe("FullViewport Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <FullViewport>
        <span>Test Content</span>
      </FullViewport>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full_viewport"
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
      <FullViewport className="custom-class">
        <span>Test Content</span>
      </FullViewport>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full_viewport custom-class"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });
});
