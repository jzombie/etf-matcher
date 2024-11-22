import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Aside from "./Aside";
import Content from "./Content";

describe("Content Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Content>
        <span>Test Content</span>
      </Content>,
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
      </Content>,
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
      </Content>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("adapts layout when Aside is a direct child", () => {
    const { container } = render(
      <Content>
        <Aside>Left Sidebar</Aside>
        <div>Main Content</div>
      </Content>,
    );

    expect(container.firstChild).toHaveClass("content-row");
  });
});
