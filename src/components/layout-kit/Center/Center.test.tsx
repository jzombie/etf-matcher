import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Center from "./Center";
import { describe, it, expect } from "vitest";

describe("Center Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Center>
        <span>Test Content</span>
      </Center>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="_center_7f9c7e"
        >
          <div
            class="_content_wrap_7f9c7e"
          >
            <span>
              Test Content
            </span>
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Center className="custom-class">
        <span>Test Content</span>
      </Center>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
            <DocumentFragment>
              <div
                class="_center_7f9c7e custom-class"
              >
                <div
                  class="_content_wrap_7f9c7e"
                >
                  <span>
                    Test Content
                  </span>
                </div>
              </div>
            </DocumentFragment>
          `);
  });
});
