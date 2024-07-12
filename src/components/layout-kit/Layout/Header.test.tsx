import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Header from "./Header";
import { describe, it, expect } from "vitest";

describe("Header Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Header>
        <span>Test Content</span>
      </Header>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Header className="custom-class">
        <span>Test Content</span>
      </Header>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
