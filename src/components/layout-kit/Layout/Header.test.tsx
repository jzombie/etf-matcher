import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Header from "./Header";
import { describe, it, expect } from "vitest";

describe("Header Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Header>
        <span>Test Content</span>
      </Header>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <header
          class="header"
        >
          <span>
            Test Content
          </span>
        </header>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Header className="custom-class">
        <span>Test Content</span>
      </Header>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <header
          class="header custom-class"
        >
          <span>
            Test Content
          </span>
        </header>
      </DocumentFragment>
    `);
  });
});
