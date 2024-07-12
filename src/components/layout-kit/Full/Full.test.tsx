import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Full from "./Full";
import { describe, it, expect } from "vitest";

describe("Full Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Full>
        <span>Test Content</span>
      </Full>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Full className="custom-class">
        <span>Test Content</span>
      </Full>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
