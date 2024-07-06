// useStateEmitterReader.test.ts
import { renderHook, act } from "@testing-library/react";
import EmitterState, { StateEmitterDefaultEvents } from "./StateEmitter";
import useStateEmitterReader from "./useStateEmitterReader";

interface TestState {
  count: number;
  text: string;
}

describe("useStateEmitterReader", () => {
  let emitter: EmitterState<TestState>;

  beforeEach(() => {
    emitter = new EmitterState<TestState>({ count: 0, text: "initial" });
  });

  it("should read the initial state", () => {
    const { result } = renderHook(() => useStateEmitterReader(emitter));
    expect(result.current).toEqual({ count: 0, text: "initial" });
  });

  it("should update state when the emitter state changes", () => {
    const { result } = renderHook(() => useStateEmitterReader(emitter));

    act(() => {
      emitter.setState({ count: 1 });
    });

    expect(result.current).toEqual({ count: 1, text: "initial" });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    expect(result.current).toEqual({ count: 1, text: "updated" });
  });

  it("should only subscribe to specific state keys", () => {
    const { result } = renderHook(() =>
      useStateEmitterReader(emitter, ["count"])
    );

    expect(result.current).toEqual({ count: 0 });

    act(() => {
      emitter.setState({ count: 1 });
    });

    expect(result.current).toEqual({ count: 1 });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    expect(result.current).toEqual({ count: 1 });
  });

  it("should handle deep equal state comparisons", () => {
    const { result } = renderHook(() => useStateEmitterReader(emitter));

    const initialState = result.current;

    act(() => {
      emitter.setState({ count: 0 });
    });

    // Because the state is deeply equal, it should not trigger a re-render
    expect(result.current).toBe(initialState);

    act(() => {
      emitter.setState({ text: "initial" });
    });

    // Because the state is deeply equal, it should not trigger a re-render
    expect(result.current).toBe(initialState);
  });

  it("should handle cyclic references", () => {
    const obj: any = { count: 0 };
    obj.self = obj;

    act(() => {
      emitter.setState({ count: obj });
    });

    const { result } = renderHook(() =>
      useStateEmitterReader(emitter, ["count"])
    );

    expect(result.current).toEqual({ count: obj });
  });

  it("should not re-render when unrelated keys are changed", () => {
    let renderCount = 0;
    const { result, rerender } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count"]);
    });

    expect(result.current).toEqual({ count: 0 });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ text: "updated" });
    });

    // The render count should not increase because we are only listening to 'count'
    expect(renderCount).toBe(1);
  });

  it("should re-render when the subscribed key is changed", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count"]);
    });

    expect(result.current).toEqual({ count: 0 });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ count: 1 });
    });

    // The render count should increase because 'count' was changed
    expect(renderCount).toBe(2);
    expect(result.current).toEqual({ count: 1 });
  });
});
