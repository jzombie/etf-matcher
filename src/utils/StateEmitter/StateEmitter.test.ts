import { describe, expect, it, vi } from "vitest";

import deepFreeze from "@utils/deepFreeze";

import StateEmitter, { StateEmitterDefaultEvents } from "./StateEmitter";

interface TestState extends Record<string, unknown> {
  count: number;
  text: string;
}

describe("StateEmitter", () => {
  it("should initialize with given state", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    expect(emitter.state).toEqual(deepFreeze(initialState));
    expect(emitter.initialState).toEqual(deepFreeze(initialState));
  });

  it("should throw error if initial state is not provided", () => {
    expect(() => {
      // @ts-expect-error Expected error here for test case
      new StateEmitter();
    }).toThrow("Initial state must be provided.");
  });

  it("should update state correctly", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    emitter.setState({ count: 1 });
    expect(emitter.state).toEqual(deepFreeze({ count: 1, text: "hello" }));

    emitter.setState((prevState) => ({ text: prevState.text + " world" }));
    expect(emitter.state).toEqual(
      deepFreeze({ count: 1, text: "hello world" }),
    );
  });

  it("should emit update event with keys used in the partial state", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on(StateEmitterDefaultEvents.UPDATE, listener);

    // Call setState with partial state
    emitter.setState({ count: 1 });

    // Check if the listener was called with the correct event and keys
    expect(listener).toHaveBeenCalledWith(["count"]);

    // Call setState with a function that updates partial state
    emitter.setState((prevState) => ({ text: prevState.text + " world" }));

    // Check if the listener was called with the correct event and keys
    expect(listener).toHaveBeenCalledWith(["text"]);
  });

  it("should not emit update event when emitUpdate is false", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on(StateEmitterDefaultEvents.UPDATE, listener);

    // Call setState with emitUpdate set to false
    emitter.setState({ count: 1 }, false);

    // Listener should not be called because emitUpdate is false
    expect(listener).not.toHaveBeenCalled();

    // Verify the state was updated correctly
    expect(emitter.state).toEqual(deepFreeze({ count: 1, text: "hello" }));
  });

  it("should subscribe to state updates and call listeners", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    const unsubscribe = emitter.subscribe(
      StateEmitterDefaultEvents.UPDATE,
      listener,
    );

    emitter.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitter.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should return partial state based on keys", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    expect(emitter.getState(["count"])).toEqual({ count: 0 });
    expect(emitter.getState(["text"])).toEqual({ text: "hello" });
    expect(emitter.getState(["count", "text"])).toEqual({
      count: 0,
      text: "hello",
    });
  });

  it("should emit update event on state change", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on(StateEmitterDefaultEvents.UPDATE, listener);

    emitter.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not allow direct modification of state", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    expect(() => {
      emitter.state = { count: 1, text: "world" };
    }).toThrow("State is read-only. Use setState to modify the state.");
  });

  it("should throw error if initial state contains reserved keys", () => {
    const reservedInitialState = {
      count: 0,
      text: "hello",
      UPDATE: "reserved",
    };

    expect(() => {
      new StateEmitter<any>(reservedInitialState);
    }).toThrow('State key "UPDATE" conflicts with reserved event.');
  });

  it("should allow initial state without reserved keys", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    expect(() => {
      new StateEmitter<TestState>(initialState);
    }).not.toThrow();
  });

  it("should register dispose functions and call them on dispose", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const disposeFn1 = vi.fn();
    const disposeFn2 = vi.fn();

    emitter.registerDispose(disposeFn1);
    emitter.registerDispose(disposeFn2);

    emitter.dispose();

    expect(disposeFn1).toHaveBeenCalledTimes(1);
    expect(disposeFn2).toHaveBeenCalledTimes(1);
  });

  it("should call registered dispose functions in order", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const callOrder: string[] = [];
    const disposeFn1 = vi.fn(() => callOrder.push("disposeFn1"));
    const disposeFn2 = vi.fn(() => callOrder.push("disposeFn2"));

    emitter.registerDispose(disposeFn1);
    emitter.registerDispose(disposeFn2);

    emitter.dispose();

    expect(callOrder).toEqual(["disposeFn1", "disposeFn2"]);
  });

  it("should remove all event listeners on dispose", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on(StateEmitterDefaultEvents.UPDATE, listener);

    emitter.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    emitter.dispose();
    emitter.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1); // No additional calls after dispose
  });
});

interface NestedState extends Record<string, unknown> {
  nested: {
    count: number;
    text: string;
  };
}

describe("StateEmitter - Deepfreeze Tests", () => {
  it("should deepfreeze state when shouldDeepfreeze is true", () => {
    const initialState: NestedState = { nested: { count: 0, text: "hello" } };
    const emitter = new StateEmitter<NestedState>(initialState);

    // Enable deepfreeze
    emitter.shouldDeepfreeze = true;
    emitter.setState({ nested: { count: 1, text: "hello" } });

    // Attempt to modify the deeply nested state
    expect(() => {
      (emitter.state.nested as any).count = 2;
    }).toThrow();
    expect(emitter.state).toEqual(
      deepFreeze({ nested: { count: 1, text: "hello" } }),
    );
  });

  it("should not deepfreeze state when shouldDeepfreeze is false", () => {
    const initialState: NestedState = { nested: { count: 0, text: "hello" } };
    const emitter = new StateEmitter<NestedState>(initialState);

    // Disable deepfreeze
    emitter.shouldDeepfreeze = false;
    emitter.setState({ nested: { count: 1, text: "hello" } });

    // Modify the deeply nested state (incorrectly)
    (emitter.state.nested as any).count = 2;
    expect(emitter.state).toEqual({ nested: { count: 2, text: "hello" } });
  });

  it("should deepfreeze initialState by default", () => {
    const initialState: NestedState = { nested: { count: 0, text: "hello" } };
    const emitter = new StateEmitter<NestedState>(initialState);
    // Attempt to modify the deeply nested initial state
    expect(() => {
      (emitter.initialState.nested as any).count = 2;
    }).toThrow();
    expect(Object.isFrozen(emitter.initialState)).toBe(true);
  });
});

describe("StateEmitter - Reset Method", () => {
  it("should reset state to initial state", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    // Modify the state
    emitter.setState({ count: 1, text: "world" });
    expect(emitter.state).toEqual(deepFreeze({ count: 1, text: "world" }));

    // Reset the state
    emitter.reset();
    expect(emitter.state).toEqual(deepFreeze(initialState));
  });
});
