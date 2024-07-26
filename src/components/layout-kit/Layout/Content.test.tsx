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
        <main
          class="content"
        >
          <span>
            Test Content
          </span>
        </main>
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
        <main
          class="content custom-class"
        >
          <span>
            Test Content
          </span>
        </main>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Content ref={ref}>
        <span>Test Content</span>
      </Content>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
