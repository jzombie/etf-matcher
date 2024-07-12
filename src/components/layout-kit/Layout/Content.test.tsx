import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Content from "./Content";
import { describe, it, expect } from "vitest";

describe("Content Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Content>
        <span>Test Content</span>
      </Content>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="_content_86779f"
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
      <Content className="custom-class">
        <span>Test Content</span>
      </Content>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div
        class="_content_86779f custom-class"
      >
        <span>
          Test Content
        </span>
      </div>
    </DocumentFragment>
  `);
  });
});
