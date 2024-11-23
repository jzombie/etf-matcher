import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Padding from "./Padding";

describe("Padding Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Padding>
        <span>Test Content</span>
      </Padding>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <section
          class="padding"
        >
          <span>
            Test Content
          </span>
        </section>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Padding className="custom-class">
        <span>Test Content</span>
      </Padding>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <section
          class="padding custom-class"
        >
          <span>
            Test Content
          </span>
        </section>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Padding ref={ref}>
        <span>Test Content</span>
      </Padding>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("applies half padding when 'half' prop is true", () => {
    const { container, asFragment } = render(
      <Padding half>
        <span>Test Content</span>
      </Padding>,
    );
    expect(container.firstChild).toHaveClass("half");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <section
          class="padding half"
        >
          <span>
            Test Content</span>
        </section>
      </DocumentFragment>
    `);
  });
});
