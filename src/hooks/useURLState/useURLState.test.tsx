import React from "react";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useURLState from "./useURLState";

// Mock the useLocation and useNavigate hooks from react-router-dom
vi.mock("react-router-dom", async () => {
  const originalModule = await vi.importActual<any>("react-router-dom");
  return {
    ...originalModule,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe("useURLState hook", () => {
  beforeEach(() => {
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "",
    });
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      vi.fn()
    );
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useURLState(), {
      wrapper: MemoryRouter,
    });

    expect(result.current.urlState).toEqual({});
  });

  it("should set and merge new state values", () => {
    const { result, rerender } = renderHook(() => useURLState(), {
      wrapper: MemoryRouter,
    });

    act(() => {
      result.current.setURLState({ search: "test" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?search=test",
    });

    rerender();

    expect(result.current.urlState).toEqual({ search: "test" });

    act(() => {
      result.current.setURLState({ page: "1" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?search=test&page=1",
    });

    rerender();

    expect(result.current.urlState).toEqual({ search: "test", page: "1" });
  });

  it("should remove a state key when set to null", () => {
    const { result, rerender } = renderHook(() => useURLState(), {
      wrapper: MemoryRouter,
    });

    act(() => {
      result.current.setURLState({ search: "test", page: "1" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?search=test&page=1",
    });

    rerender();

    expect(result.current.urlState).toEqual({ search: "test", page: "1" });

    act(() => {
      result.current.setURLState({ search: null });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?page=1",
    });

    rerender();

    expect(result.current.urlState).toEqual({ page: "1" });
  });

  it("should trigger the callback on state change", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useURLState(callback), {
      wrapper: MemoryRouter,
    });

    act(() => {
      result.current.setURLState({ search: "test" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?search=test",
    });

    rerender();

    expect(callback).toHaveBeenCalledWith({ search: "test" });

    act(() => {
      result.current.setURLState({ page: "1" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?search=test&page=1",
    });

    rerender();

    expect(callback).toHaveBeenCalledWith({ search: "test", page: "1" });
  });

  it("should get boolean parameter with default value", () => {
    const { result, rerender } = renderHook(() => useURLState(), {
      wrapper: MemoryRouter,
    });

    act(() => {
      result.current.setURLState({ exact: "true" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?exact=true",
    });

    rerender();

    expect(result.current.getBooleanParam("exact", false)).toBe(true);

    act(() => {
      result.current.setURLState({ exact: "false" });
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/",
      search: "?exact=false",
    });

    rerender();

    expect(result.current.getBooleanParam("exact", true)).toBe(false);

    expect(result.current.getBooleanParam("nonexistent", true)).toBe(true);
  });

  it("should use new pathname if provided", () => {
    const { result, rerender } = renderHook(() => useURLState(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current.setURLState({ search: "test" }, true, "/new-path");
    });

    // Mocking useLocation to return the updated search params
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/new-path",
      search: "?search=test",
    });

    rerender();

    expect(result.current.urlState).toEqual({ search: "test" });

    const navigateMock = useNavigate();
    expect(navigateMock).toHaveBeenCalledWith(
      {
        pathname: "/new-path",
        search: "search=test",
      },
      { replace: true }
    );
  });
});
