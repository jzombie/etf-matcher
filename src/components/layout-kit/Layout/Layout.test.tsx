import React from "react";

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Layout from "./Layout";

describe("Layout Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <Layout>
        <Header>Test Header</Header>
        <Content>Test Content</Content>
        <Footer>Test Footer</Footer>
      </Layout>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="layout"
        >
          <header
            class="header"
          >
            Test Header
          </header>
          <main
            class="content"
          >
            Test Content
          </main>
          <footer
            class="footer"
          >
            Test Footer
          </footer>
        </div>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <Layout className="custom-class">
        <Header>Test Header</Header>
        <Content>Test Content</Content>
        <Footer>Test Footer</Footer>
      </Layout>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="layout custom-class"
        >
          <header
            class="header"
          >
            Test Header
          </header>
          <main
            class="content"
          >
            Test Content
          </main>
          <footer
            class="footer"
          >
            Test Footer
          </footer>
        </div>
      </DocumentFragment>
    `);
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Layout ref={ref}>
        <Header>Test Header</Header>
        <Content>Test Content</Content>
        <Footer>Test Footer</Footer>
      </Layout>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
