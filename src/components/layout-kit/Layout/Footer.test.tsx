import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Footer from "./Footer";

describe("Footer Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Footer>
        <span>Test Content</span>
      </Footer>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <footer
          class="footer"
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
      </Footer>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <footer
          class="footer custom-class"
        >
          <span>
            Test Content
          </span>
        </footer>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Footer ref={ref}>
        <span>Test Content</span>
      </Footer>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
