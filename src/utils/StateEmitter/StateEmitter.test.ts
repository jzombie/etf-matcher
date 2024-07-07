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

describe("StateEmitter - emitState", () => {
  it("should emit state key immediately if no debounce is specified", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on("count", listener);

    emitter.debounceEmitState("count");
    expect(listener).toHaveBeenCalledWith(0);
  });

  it("should emit state key with debounce", async () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on("count", listener);

    emitter.debounceEmitState("count", 100);
    expect(listener).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(listener).toHaveBeenCalledWith(0);
  });

  it("should reset debounce if called again within debounce period", async () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on("count", listener);

    emitter.debounceEmitState("count", 100);
    expect(listener).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 50));

    emitter.debounceEmitState("count", 100);
    expect(listener).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(0);
  });

  it("should emit state key immediately if debounce is zero", () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener = vi.fn();
    emitter.on("count", listener);

    emitter.debounceEmitState("count", 0);
    expect(listener).toHaveBeenCalledWith(0);
  });

  it("should clear debounced emit state", async () => {
    const initialState: TestState = { count: 0, text: "hello" };
    const emitter = new StateEmitter<TestState>(initialState);

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    emitter.on("count", listener1);
    emitter.on("text", listener2);

    emitter.debounceEmitState("count", 20);
    expect(listener1).not.toHaveBeenCalled();

    emitter.debounceEmitState("text", 20);
    expect(listener2).not.toHaveBeenCalled();

    emitter.clearDebouncedEmitState("count");

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
