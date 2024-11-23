import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Aside from "./Aside";

describe("Aside Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Aside>
        <span>Test Aside Content</span>
      </Aside>,
    );
    expect(getByText("Test Aside Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <aside
          class="aside"
        >
          <span>
            Test Aside Content
          </span>
        </aside>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Aside className="custom-class">Test Content</Aside>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
