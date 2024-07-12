import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Content from "./Content";
import { describe, it, expect } from "vitest";

describe("Content Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Content>
        <span>Test Content</span>
      </Content>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Content className="custom-class">
        <span>Test Content</span>
      </Content>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
