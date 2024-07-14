import { describe, it, expect } from "vitest";
import formatByteSize from "./formatByteSize";

describe("formatSize", () => {
  it("should format bytes correctly", () => {
    expect(formatByteSize(0)).toBe("0 Bytes");
    expect(formatByteSize(500)).toBe("500 Bytes");
    expect(formatByteSize(1023)).toBe("1,023 Bytes");
  });

  it("should format kilobytes correctly", () => {
    expect(formatByteSize(1024)).toBe("1 KB");
    expect(formatByteSize(2048)).toBe("2 KB");
    expect(formatByteSize(1536)).toBe("1.5 KB");
  });

  it("should format megabytes correctly", () => {
    expect(formatByteSize(1048576)).toBe("1 MB");
    expect(formatByteSize(2097152)).toBe("2 MB");
    expect(formatByteSize(1572864)).toBe("1.5 MB");
  });

  it("should format gigabytes correctly", () => {
    expect(formatByteSize(1073741824)).toBe("1 GB");
    expect(formatByteSize(2147483648)).toBe("2 GB");
    expect(formatByteSize(1610612736)).toBe("1.5 GB");
  });

  it("should format terabytes correctly", () => {
    expect(formatByteSize(1099511627776)).toBe("1 TB");
    expect(formatByteSize(2199023255552)).toBe("2 TB");
    expect(formatByteSize(1649267441664)).toBe("1.5 TB");
  });

  it("should add commas correctly for large numbers", () => {
    expect(formatByteSize(123456789)).toBe("117.74 MB");
    expect(formatByteSize(1234567890)).toBe("1.15 GB");
    expect(formatByteSize(1234567890123)).toBe("1.12 TB");
  });
});
