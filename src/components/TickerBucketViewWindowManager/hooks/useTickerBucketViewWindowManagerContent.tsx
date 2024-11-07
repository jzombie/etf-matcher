import React, { useMemo } from "react";

import type { TickerBucket } from "@src/store";
import { MosaicNode } from "react-mosaic-component";

export default function useTickerBucketViewWindowManagerContent(
  tickerBucket: TickerBucket,
  isTiling: boolean,
) {
  // TODO: Redefine as necessary
  const initialLayout: MosaicNode<string> = useMemo(
    () => ({
      first: {
        direction: "column",
        first: {
          direction: "row",
          first: "Ticker Information",
          second: "Historical Prices",
          splitPercentage: 39.361702127659576,
        },
        second: {
          first: "Sector Allocation",
          second: "Similarity Search",
          direction: "row",
          splitPercentage: 40.13679097684473,
        },
        splitPercentage: 52.089700882585255,
      },
      second: {
        first: "ETF Holders and Holdings",
        second: "Fundamentals",
        direction: "column",
        splitPercentage: 51.89061500352696,
      },
      direction: "row",
      splitPercentage: 60.4332129963899,
    }),
    [],
  );

  // TODO: Redefine as necessary
  const contentMap = useMemo(
    () => ({
      "Ticker Information": (
        <div>
          TODO: Render combined ticker information. Possibly incliude checkboxes
          to dynamically hide/show a particular ticker from the calculations.
        </div>
      ),
      "Historical Prices": (
        <div>TODO: Render multiple items in the same chart</div>
      ),
      "Sector Allocation": <div>Render combined weighted allocations</div>,
      "Similarity Search": (
        <div>
          TODO: Use this opportunity to render PCA scatter plot of the entire
          bucket
        </div>
      ),
      "ETF Holders and Holdings": (
        <div>
          TODO: Possibly replace with the ability to manage the bucket itself
        </div>
      ),
      Fundamentals: <div>TODO: Render combined fundamentals</div>,
    }),
    [],
  );

  return {
    initialLayout,
    contentMap,
  };
}
