import React from "react";
import "@testing-library/jest-dom";
import { render, fireEvent } from "@testing-library/react";
import ContentButton from "./ContentButton";
import { describe, it, expect, vi } from "vitest";

describe("ContentButton Component", () => {
  it("renders children correctly", () => {
    const { getByText, asFragment } = render(
      <ContentButton>
        <span>Test Content</span>
      </ContentButton>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="content_button"
        >
          <span>
            Test Content
          </span>
          <div
            class="full cover cover"
          >
            <button
              class="button"
            />
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it("applies custom className", () => {
    const { container, asFragment } = render(
      <ContentButton className="custom-class">
        <span>Test Content</span>
      </ContentButton>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="content_button custom-class"
        >
          <span>
            Test Content
          </span>
          <div
            class="full cover cover"
          >
            <button
              class="button"
            />
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it("calls onClick when button is clicked", () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <ContentButton onClick={handleClick}>
        <span>Test Content</span>
      </ContentButton>
    );

    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when disabled prop is true", () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <ContentButton onClick={handleClick} disabled>
        <span>Test Content</span>
      </ContentButton>
    );

    const button = getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
