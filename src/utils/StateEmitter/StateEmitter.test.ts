import { describe, it, expect, vi } from "vitest";
import StateEmitter, { StateEmitterDefaultEvents } from "./StateEmitter";
import deepFreeze from "@utils/deepFreeze";

interface TestState {
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
      // @ts-ignore: Suppress the error for this test case
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
      deepFreeze({ count: 1, text: "hello world" })
    );
  });

  it("should subscribe to state updates and call listeners", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    const unsubscribe = emitter.subscribe(
      StateEmitterDefaultEvents.UPDATE,
      listener
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
      // @ts-ignore: Suppress the error for this test case
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
});

interface NestedState {
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
      deepFreeze({ nested: { count: 1, text: "hello" } })
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
