import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Scrollable from "./Scrollable";
import { describe, it, expect } from "vitest";
import styles from "./Scrollable.module.scss";

describe("Scrollable Component", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <Scrollable>
        <span>Test Content</span>
      </Scrollable>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Scrollable className="custom-class">
        <span>Test Content</span>
      </Scrollable>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("enables horizontal scrolling when scrollX is true", () => {
    const { container } = render(
      <Scrollable scrollX>
        <span>Test Content</span>
      </Scrollable>
    );
    expect(container.firstChild).toHaveClass(styles.scroll_x);
  });

  it("enables vertical scrolling when scrollY is true", () => {
    const { container } = render(
      <Scrollable scrollY>
        <span>Test Content</span>
      </Scrollable>
    );
    expect(container.firstChild).toHaveClass(styles.scroll_y);
  });
});
