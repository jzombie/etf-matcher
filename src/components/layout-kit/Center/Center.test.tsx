import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Center from "./Center";
import { describe, it, expect } from "vitest";

describe("Center Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Center>
        <span>Test Content</span>
      </Center>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Center className="custom-class">
        <span>Test Content</span>
      </Center>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
