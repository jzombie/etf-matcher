import { render } from "@testing-library/react";

import { beforeEach, describe, expect, test, vi } from "vitest";

import useKeyboardEvents from "./useKeyboardEvents";

// Define the types for the callbacks prop
type TestComponentProps = {
  callbacks: {
    keydown?: { [key: string]: (event: KeyboardEvent) => void };
    keyup?: { [key: string]: (event: KeyboardEvent) => void };
  };
};

// Directly use `useKeyboardEvents` with native events
const TestComponent: React.FC<TestComponentProps> = ({ callbacks }) => {
  const { onKeyDown, onKeyUp } = useKeyboardEvents(callbacks, true); // attach to window

  return <div onKeyDown={onKeyDown} onKeyUp={onKeyUp} />;
};

// Assuming this is your TestComponent

describe("useKeyboardEvents", () => {
  let keydownCallback: ReturnType<typeof vi.fn>;
  let keyupCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    keydownCallback = vi.fn();
    keyupCallback = vi.fn();
  });

  test("calls keydown callback on Enter key", () => {
    render(
      <TestComponent callbacks={{ keydown: { Enter: keydownCallback } }} />,
    );

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    window.dispatchEvent(event);

    expect(keydownCallback).toHaveBeenCalledTimes(1);
  });

  test("calls keyup callback on Enter key", () => {
    render(<TestComponent callbacks={{ keyup: { Enter: keyupCallback } }} />);

    const event = new KeyboardEvent("keyup", { key: "Enter" });
    window.dispatchEvent(event);

    expect(keyupCallback).toHaveBeenCalledTimes(1);
  });

  test("does not call callback for unregistered key", () => {
    render(<TestComponent callbacks={{ keydown: {} }} />);

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    window.dispatchEvent(event);

    expect(keydownCallback).not.toHaveBeenCalled();
  });

  test("stops propagation of keydown event", () => {
    const stopPropagation = vi.fn();
    render(
      <TestComponent
        callbacks={{
          keydown: {
            Enter: (evt) => {
              evt.stopPropagation();
            },
          },
        }}
      />,
    );

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    Object.defineProperty(event, "stopPropagation", { value: stopPropagation });

    window.dispatchEvent(event);

    expect(stopPropagation).toHaveBeenCalled();
  });
});
