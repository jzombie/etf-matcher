import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Full from "./Full";

describe("Full Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Full>
        <span>Test Content</span>
      </Full>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full"
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
      <Full className="custom-class">
        <span>Test Content</span>
      </Full>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="full custom-class"
        >
          <span>
            Test Content
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Full ref={ref}>
        <span>Test Content</span>
      </Full>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders the specified HTML element when using the 'component' prop", () => {
    const { container } = render(
      <Full component="section">
        <span>Test Content</span>
      </Full>,
    );

    expect(container.firstChild).toBeInstanceOf(HTMLElement);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("passes props specific to the specified HTML element", () => {
    const { container } = render(
      <Full component="a" href="https://example.com" target="_blank">
        Link Content
      </Full>,
    );

    const anchor = container.firstChild as HTMLAnchorElement;

    expect(anchor).toBeInstanceOf(HTMLAnchorElement);
    expect(anchor.href).toBe("https://example.com/");
    expect(anchor.target).toBe("_blank");
    expect(anchor.textContent).toBe("Link Content");
  });

  it("renders a custom React component when using the 'component' prop", () => {
    const CustomComponent = ({ children }: { children: React.ReactNode }) => (
      <article data-testid="custom-component">{children}</article>
    );

    const { getByTestId, getByText } = render(
      <Full component={CustomComponent}>
        <span>Test Content</span>
      </Full>,
    );

    const customComponent = getByTestId("custom-component");
    expect(customComponent).toBeInTheDocument();
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(customComponent.nodeName).toBe("ARTICLE");
  });

  it("passes custom props to a React component", () => {
    const CustomComponent = ({
      children,
      customProp,
    }: {
      children: React.ReactNode;
      customProp: string;
    }) => (
      <article data-custom-prop={customProp} data-testid="custom-prop">
        {children}
      </article>
    );

    const { getByTestId, getByText } = render(
      <Full component={CustomComponent} customProp="test-value">
        Custom Component Content
      </Full>,
    );

    const customComponent = getByTestId("custom-prop");

    expect(customComponent).toBeInTheDocument();
    expect(customComponent).toHaveAttribute("data-custom-prop", "test-value");
    expect(getByText("Custom Component Content")).toBeInTheDocument();
  });
});
