import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Footer from "./Footer";
import { describe, it, expect } from "vitest";

describe("Footer Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Footer>
        <span>Test Content</span>
      </Footer>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Footer className="custom-class">
        <span>Test Content</span>
      </Footer>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
