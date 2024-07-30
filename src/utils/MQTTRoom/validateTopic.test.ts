import { describe, expect, it } from "vitest";

import validateTopic from "./validateTopic";

describe("validateTopic", () => {
  it("should return true for a valid topic", () => {
    expect(validateTopic("home/kitchen/temperature")).toBe(true);
  });

  it('should return false for a topic with "+" character', () => {
    expect(validateTopic("home/+/temperature")).toBe(false);
  });

  it('should return false for a topic with "#" character', () => {
    expect(validateTopic("home/kitchen/#")).toBe(false);
  });

  it("should return false for a topic with empty levels", () => {
    expect(validateTopic("home//temperature")).toBe(false);
  });

  it("should return false for a topic with a leading slash", () => {
    expect(validateTopic("/home/kitchen/temperature")).toBe(false);
  });

  it("should return false for a topic with a trailing slash", () => {
    expect(validateTopic("home/kitchen/temperature/")).toBe(false);
  });

  it("should return false for a topic with a null character", () => {
    expect(validateTopic("home/kitchen/temperature\u0000")).toBe(false);
  });

  it("should return false for a topic exceeding length limit", () => {
    const longTopic = "a".repeat(65536);
    expect(validateTopic(longTopic)).toBe(false);
  });

  it("should return true for a topic exactly at length limit", () => {
    const longTopic = "a".repeat(65535);
    expect(validateTopic(longTopic)).toBe(true);
  });

  it("should return false for a topic starting with a forward slash", () => {
    expect(validateTopic("/home/kitchen/temperature")).toBe(false);
  });
});
