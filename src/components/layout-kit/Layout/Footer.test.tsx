import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Footer from "./Footer";
import { describe, it, expect } from "vitest";

describe("Footer Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Footer>
        <span>Test Content</span>
      </Footer>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <footer
          class="_footer_86779f"
        >
          <span>
            Test Content
          </span>
        </footer>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Footer className="custom-class">
        <span>Test Content</span>
      </Footer>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <footer
        class="_footer_86779f custom-class"
      >
        <span>
          Test Content
        </span>
      </footer>
    </DocumentFragment>
  `);
  });
});
