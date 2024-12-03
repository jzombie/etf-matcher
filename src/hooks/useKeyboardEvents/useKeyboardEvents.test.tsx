import React from "react";

import { fireEvent, render } from "@testing-library/react";

import { beforeEach, describe, expect, test, vi } from "vitest";

import useKeyboardEvents, { KeyboardEventsProps } from "./useKeyboardEvents";

// Directly use `useKeyboardEvents` with native events
const TestComponent: React.FC<KeyboardEventsProps> = ({ ...rest }) => {
  const { onKeyDown, onKeyUp } = useKeyboardEvents({ ...rest });

  return <div onKeyDown={onKeyDown} onKeyUp={onKeyUp} data-testid="test-div" />;
};

describe("useKeyboardEvents", () => {
  let keydownCallback: ReturnType<typeof vi.fn>;
  let keyupCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    keydownCallback = vi.fn();
    keyupCallback = vi.fn();
  });

  describe("when attached to the window", () => {
    test("calls keydown callback on Enter key", () => {
      render(
        <TestComponent
          keyDown={{ Enter: keydownCallback }}
          attachToWindow={true}
        />,
      );

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      window.dispatchEvent(event);

      expect(keydownCallback).toHaveBeenCalledTimes(1);
    });

    test("calls keyup callback on Enter key", () => {
      render(
        <TestComponent
          keyUp={{ Enter: keyupCallback }}
          attachToWindow={true}
        />,
      );

      const event = new KeyboardEvent("keyup", { key: "Enter" });
      window.dispatchEvent(event);

      expect(keyupCallback).toHaveBeenCalledTimes(1);
    });

    test("does not call callback for unregistered key", () => {
      render(<TestComponent keyDown={{}} attachToWindow={true} />);

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      window.dispatchEvent(event);

      expect(keydownCallback).not.toHaveBeenCalled();
    });

    test("stops propagation of keydown event", () => {
      const stopPropagation = vi.fn();
      render(
        <TestComponent
          keyDown={{
            Enter: () => {
              // no-op
            },
          }}
          attachToWindow={true}
        />,
      );

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      Object.defineProperty(event, "stopPropagation", {
        value: stopPropagation,
      });

      window.dispatchEvent(event);

      expect(stopPropagation).toHaveBeenCalled();
    });

    describe("useKeyboardEvents - preventDefault and stopPropagation flags", () => {
      let keydownCallback: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        keydownCallback = vi.fn();
        keyupCallback = vi.fn();
      });

      test("calls preventDefault when preventDefault is true", () => {
        const preventDefault = vi.fn();
        render(
          <TestComponent
            keyDown={{
              Enter: keydownCallback,
            }}
            preventDefault={true}
          />,
        );

        const event = new KeyboardEvent("keydown", { key: "Enter" });
        Object.defineProperty(event, "preventDefault", {
          value: preventDefault,
        });

        window.dispatchEvent(event);

        expect(preventDefault).toHaveBeenCalledTimes(1);
      });

      test("does not call preventDefault when preventDefault is false", () => {
        const preventDefault = vi.fn();
        render(
          <TestComponent
            keyDown={{
              Enter: keydownCallback,
            }}
            preventDefault={false}
          />,
        );

        const event = new KeyboardEvent("keydown", { key: "Enter" });
        Object.defineProperty(event, "preventDefault", {
          value: preventDefault,
        });

        window.dispatchEvent(event);

        expect(preventDefault).not.toHaveBeenCalled();
      });

      test("calls stopPropagation when stopPropagation is true", () => {
        const stopPropagation = vi.fn();
        render(
          <TestComponent
            keydown={{
              Enter: keydownCallback,
            }}
            stopPropagation={true}
          />,
        );

        const event = new KeyboardEvent("keydown", { key: "Enter" });
        Object.defineProperty(event, "stopPropagation", {
          value: stopPropagation,
        });

        window.dispatchEvent(event);

        expect(stopPropagation).toHaveBeenCalledTimes(1);
      });

      test("does not call stopPropagation when stopPropagation is false", () => {
        const stopPropagation = vi.fn();
        render(
          <TestComponent
            keyDown={{
              Enter: keydownCallback,
            }}
            stopPropagation={false}
          />,
        );

        const event = new KeyboardEvent("keydown", { key: "Enter" });
        Object.defineProperty(event, "stopPropagation", {
          value: stopPropagation,
        });

        window.dispatchEvent(event);

        expect(stopPropagation).not.toHaveBeenCalled();
      });
    });
  });

  describe("when not attached to the window", () => {
    // FIXME: Additionally, ensuring these aren't bound directly to the window
    // would be good, but I've currently been unsuccessful with my attempts to
    // make spies that work for this use case. The best that I've done is ensure
    // the `useEffect` `attachToWindow` condition is being invoked properly.

    test("calls event handler via element keydown, and not on window", () => {
      const { getByTestId } = render(
        <TestComponent
          keyDown={{ Enter: keydownCallback }}
          attachToWindow={false}
        />,
      );

      const div = getByTestId("test-div");

      // Use `fireEvent` to simulate the keydown event on the `div`
      fireEvent.keyDown(div, { key: "Enter" });

      expect(keydownCallback).toHaveBeenCalledTimes(1);
    });

    test("calls event handler via element keyup, and not on window", () => {
      const { getByTestId } = render(
        <TestComponent
          keyUp={{ Enter: keyupCallback }}
          attachToWindow={false}
        />,
      );

      const div = getByTestId("test-div");

      // Use `fireEvent` to simulate the keyup event on the `div`
      fireEvent.keyUp(div, { key: "Enter" });

      expect(keyupCallback).toHaveBeenCalledTimes(1);
    });
  });
});
