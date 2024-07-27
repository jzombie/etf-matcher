import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Center from "./Center";

describe("Center Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Center>
        <span>Test Content</span>
      </Center>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="center"
        >
          <div
            class="content_wrap"
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
      </Center>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="center custom-class"
        >
          <div
            class="content_wrap"
          >
            <span>
              Test Content
            </span>
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Center ref={ref}>
        <span>Test Content</span>
      </Center>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
