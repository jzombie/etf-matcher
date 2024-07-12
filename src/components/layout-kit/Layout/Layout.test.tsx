import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Layout from "./Layout";
import { describe, it, expect } from "vitest";

describe("Layout Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Layout>
        <span>Test Content</span>
      </Layout>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="layout"
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
      <Layout className="custom-class">
        <span>Test Content</span>
      </Layout>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="layout custom-class"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });
});
