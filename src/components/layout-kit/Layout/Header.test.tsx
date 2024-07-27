import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Header from "./Header";

describe("Header Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Header>
        <span>Test Content</span>
      </Header>,
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
      </Header>,
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

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Header ref={ref}>
        <span>Test Content</span>
      </Header>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
