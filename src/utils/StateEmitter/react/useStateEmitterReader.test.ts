import { act, renderHook } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockInstance } from "vitest";

import customLogger from "@utils/customLogger";

import EmitterState from "../StateEmitter";
import useStateEmitterReader from "./useStateEmitterReader";

interface TestState extends Record<string, unknown> {
  count: number;
  text: string;
  items: string[];
}

describe("useStateEmitterReader", () => {
  let emitter: EmitterState<TestState>;
  let consoleWarnSpy: MockInstance;

  beforeEach(() => {
    emitter = new EmitterState<TestState>({
      count: 0,
      text: "initial",
      items: ["item1"],
    });

    consoleWarnSpy = vi
      .spyOn(customLogger, "warn")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should read the initial state", () => {
    // @ts-expect-error For non-TS checks
    const { result } = renderHook(() => useStateEmitterReader(emitter));
    expect(result.current).toEqual({
      count: 0,
      text: "initial",
      items: ["item1"],
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "`useStateEmitterReader` should be called with `stateKeyOrKeys` to improve rendering performance.",
    );
  });

  it("should update state when the emitter state changes", () => {
    // @ts-expect-error For non-TS checks
    const { result } = renderHook(() => useStateEmitterReader(emitter));

    act(() => {
      emitter.setState({ count: 1 });
    });

    expect(result.current).toEqual({
      count: 1,
      text: "initial",
      items: ["item1"],
    });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    expect(result.current).toEqual({
      count: 1,
      text: "updated",
      items: ["item1"],
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "`useStateEmitterReader` should be called with `stateKeyOrKeys` to improve rendering performance.",
    );
  });

  it("should only subscribe to specific state keys (single string)", () => {
    const { result } = renderHook(() =>
      useStateEmitterReader(emitter, "count"),
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

  it("should only subscribe to specific state keys (array of strings)", () => {
    const { result } = renderHook(() =>
      useStateEmitterReader(emitter, ["count", "text"]),
    );

    expect(result.current).toEqual({ count: 0, text: "initial" });

    act(() => {
      emitter.setState({ count: 1 });
    });

    expect(result.current).toEqual({ count: 1, text: "initial" });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    expect(result.current).toEqual({ count: 1, text: "updated" });
  });

  it("should handle deep equal state comparisons", () => {
    // @ts-expect-error For non-TS checks
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
      useStateEmitterReader(emitter, ["count"]),
    );

    expect(result.current).toEqual({ count: obj });
  });

  it("should not re-render when unrelated keys are changed (single string)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, "count");
    });

    expect(result.current).toEqual({ count: 0 });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ text: "updated" });
    });

    // The render count should not increase because we are only listening to 'count'
    expect(renderCount).toBe(1);
  });

  it("should not re-render when unrelated keys are changed (array of strings)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count", "items"]);
    });

    expect(result.current).toEqual({ count: 0, items: ["item1"] });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ text: "updated" });
    });

    // The render count should not increase because we are only listening to 'count' and 'items'
    expect(renderCount).toBe(1);
  });

  it("should re-render when the subscribed key is changed (single string)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, "count");
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

  it("should re-render when the subscribed key is changed (array of strings)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count", "text"]);
    });

    expect(result.current).toEqual({ count: 0, text: "initial" });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ count: 1 });
    });

    // The render count should increase because 'count' was changed
    expect(renderCount).toBe(2);
    expect(result.current).toEqual({ count: 1, text: "initial" });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    // The render count should increase because 'text' was changed
    expect(renderCount).toBe(3);
    expect(result.current).toEqual({ count: 1, text: "updated" });
  });

  it("should re-render when one of the multiple subscribed keys is changed (array of strings)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count", "text", "items"]);
    });

    expect(result.current).toEqual({
      count: 0,
      text: "initial",
      items: ["item1"],
    });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ count: 1 });
    });

    expect(renderCount).toBe(2);
    expect(result.current).toEqual({
      count: 1,
      text: "initial",
      items: ["item1"],
    });

    act(() => {
      emitter.setState({ items: ["item2"] });
    });

    expect(renderCount).toBe(3);
    expect(result.current).toEqual({
      count: 1,
      text: "initial",
      items: ["item2"],
    });

    act(() => {
      emitter.setState({ text: "updated" });
    });

    expect(renderCount).toBe(4);
    expect(result.current).toEqual({
      count: 1,
      text: "updated",
      items: ["item2"],
    });

    act(() => {
      emitter.setState({ text: "final" });
    });

    expect(renderCount).toBe(5);
    expect(result.current).toEqual({
      count: 1,
      text: "final",
      items: ["item2"],
    });
  });

  it("should not re-render when unrelated keys are changed (array of strings with multiple values)", () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStateEmitterReader(emitter, ["count", "items"]);
    });

    expect(result.current).toEqual({ count: 0, items: ["item1"] });
    expect(renderCount).toBe(1);

    act(() => {
      emitter.setState({ text: "updated" });
    });

    // The render count should not increase because we are only listening to 'count' and 'items'
    expect(renderCount).toBe(1);
  });
});
