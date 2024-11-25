import * as RustService from "@services/RustService";
import type { TickerBucket } from "@src/store";
import { MockInstance, describe, expect, it, vi } from "vitest";

import {
  fetchClosestTickerBucketName,
  formatTickerBucketPageTitle,
  getTickerBucketLink,
} from "./tickerBucketLinkUtils";

// Sample `TickerBucket` data
const tickerBuckets: TickerBucket[] = [
  {
    uuid: "123",
    name: "Technology",
    tickers: [],
    type: "portfolio",
    description: "Tech sector portfolio",
    isUserConfigurable: true,
  },
  {
    uuid: "456",
    name: "Health Care",
    tickers: [],
    type: "portfolio",
    description: "Healthcare investments",
    isUserConfigurable: true,
  },
  {
    uuid: "789",
    name: "Consumer Discretionary",
    tickers: [],
    type: "portfolio",
    description: "Consumer goods focus",
    isUserConfigurable: true,
  },
];

describe("getTickerBucketLink", () => {
  it("should return a correctly formatted URL link", () => {
    const result = getTickerBucketLink(tickerBuckets[0]);
    expect(result).toBe("/portfolios/technology");
  });

  it("should handle names with extra spaces and special characters", () => {
    const result = getTickerBucketLink({
      ...tickerBuckets[1],
      name: "  Health / Care ",
    });
    expect(result).toBe("/portfolios/health-%2F-care");
  });
});

describe("fetchClosestTickerBucketName", () => {
  let mockFetchLevenshteinDistance: MockInstance<
    [string, string],
    Promise<number>
  >;

  beforeEach(() => {
    mockFetchLevenshteinDistance = vi
      .spyOn(RustService, "fetchLevenshteinDistance")
      .mockImplementation(() => Promise.resolve(0)); // Default mock
  });

  it("should return the closest ticker bucket by Levenshtein distance", async () => {
    mockFetchLevenshteinDistance
      .mockResolvedValueOnce(5) // Distance to "Technology"
      .mockResolvedValueOnce(3) // Distance to "Health Care"
      .mockResolvedValueOnce(10); // Distance to "Consumer Discretionary"

    const result = await fetchClosestTickerBucketName(
      "Healthcare",
      "portfolio",
      tickerBuckets,
    );
    expect(result).toEqual(tickerBuckets[1]);

    expect(mockFetchLevenshteinDistance).toHaveBeenCalledTimes(3);
    expect(mockFetchLevenshteinDistance).toHaveBeenCalledWith(
      "Healthcare",
      "Technology",
    );
    expect(mockFetchLevenshteinDistance).toHaveBeenCalledWith(
      "Healthcare",
      "Health Care",
    );
    expect(mockFetchLevenshteinDistance).toHaveBeenCalledWith(
      "Healthcare",
      "Consumer Discretionary",
    );
  });
});

describe("formatTickerBucketPageTitle", () => {
  it("should return the name followed by a capitalized type if name doesn't include type", () => {
    const result = formatTickerBucketPageTitle(tickerBuckets[0]);
    expect(result).toBe("Technology Portfolio");
  });

  it("should return the name as is if it already ends with the type (case-insensitive)", () => {
    const result = formatTickerBucketPageTitle({
      ...tickerBuckets[1],
      name: "Health Care Portfolio",
    });
    expect(result).toBe("Health Care Portfolio");
  });

  it("should handle edge cases with capitalization", () => {
    const result = formatTickerBucketPageTitle({
      ...tickerBuckets[2],
      name: "consumer discretionary PORTFOLIO",
    });
    expect(result).toBe("consumer discretionary PORTFOLIO");
  });
});
